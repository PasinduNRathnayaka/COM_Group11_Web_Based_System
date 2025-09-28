import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Load user from localStorage on initial render
  const stored = JSON.parse(localStorage.getItem('user') || 'null');
  const initialUser = stored && stored.token ? stored : null;
  const [user, _setUser] = useState(initialUser);

  //keeps localStorage in sync
  const setUser = (newUser) => {
  _setUser(newUser);
  if (newUser) {
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', newUser.token);
    // Load cart from database when user logs in
    loadCartFromDatabase(newUser.token);
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Clear cart when user logs out
    _setCartItems([]);
    localStorage.removeItem('cartItems');
  }
};

// Load cart from database for logged-in users
const loadCartFromDatabase = async (userToken) => {
  try {
    if (!userToken) return;
    
    setIsCartLoading(true);
    
    // Sync local cart with database first (if there are local items)
    //const localCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    //if (localCartItems.length > 0) {
     // await axios.post('/api/user/cart/sync', 
      //  { localCartItems },
      //  { headers: { Authorization: `Bearer ${userToken}` } }
     // );
      //localStorage.removeItem('cartItems');
   // }
    
    // Load cart from database
    const response = await axios.get('/api/user/cart', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      _setCartItems(response.data.cartItems || []);
    }
    
  } catch (error) {
    console.error('Error loading cart from database:', error);
    const localCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    _setCartItems(localCartItems);
  } finally {
    setIsCartLoading(false);
  }
 };

  // Validate token whenever user changes
  useEffect(() => {
    const validateToken = async () => {
      if (!initialUser) return;  // if no logged in user, skip

      try {
        // Decode token expiry time
        const { exp } = jwtDecode.default(initialUser.token); // exp is in seconds

        // If token expired, throw error
        if (Date.now() >= exp * 1000) throw new Error('token expired');

        // server-side token validation
        await axios.get('/api/user/validate-token', {
          headers: { Authorization: `Bearer ${initialUser.token}` },
        });

        //Fetch fresh user profile data on app load
        const profileResponse = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${initialUser.token}` },
        });

        if (profileResponse.data.success) {
          // Update user with fresh data from server (including profilePic)
          const updatedUser = {
            ...initialUser,
            ...profileResponse.data.user
          };
          _setUser(updatedUser); // Use _setUser to avoid localStorage loop
          localStorage.setItem('user', JSON.stringify(updatedUser));
          await loadCartFromDatabase(updatedUser.token);
        }

      } catch (err) {
        console.warn('🔐 Token invalid/expired – logging out');
        //setUser(null);  // log out user if invalid
      }
    };

    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Other states
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  
  // Cart state with localStorage persistence
 const [cartItems, _setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);

  // Load cart items from localStorage on initial render
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
  // Only load from localStorage if user is not logged in
  if (!user) {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
          const parsedItems = JSON.parse(savedCartItems);
          if (Array.isArray(parsedItems)) {
            _setCartItems(parsedItems);
          }
        }
      }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cartItems');
      } finally {
        if (!user) {
  setIsCartLoading(false);
  }
      }
    };

    loadCartFromStorage();
  }, []);

  // cart setter: keeps localStorage in sync
  const setCartItems = (newCartItems) => {
    if (typeof newCartItems === 'function') {
      _setCartItems(prevItems => {
        const updatedItems = newCartItems(prevItems);
        if (!isCartLoading && !user) {
          localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        }
        return updatedItems;
      });
    } else {
      _setCartItems(newCartItems);
      if (!isCartLoading && !user) {
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      }
    }
  };

  const addToCart = async (product, quantity = 1) => {
  try {
    if (user?.token) {
      const response = await axios.post('/api/user/cart', {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        description: product.description || product.desc || ''
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (response.data.success) {
        _setCartItems(response.data.cartItems);
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }
};

  const removeFromCart = async (productId) => {
  try {
    if (user?.token) {
      const response = await axios.delete(`/api/user/cart/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (response.data.success) {
        _setCartItems(response.data.cartItems);
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }
};

const updateQuantity = async (productId, newQuantity) => {
  try {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (user?.token) {
      const response = await axios.put('/api/user/cart', {
        productId: productId,
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (response.data.success) {
        _setCartItems(response.data.cartItems);
      }
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }
};

const clearCart = async () => {
  try {
    if (user?.token) {
      const response = await axios.delete('/api/user/cart', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (response.data.success) {
        _setCartItems([]);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cartItems');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    setCartItems([]);
    localStorage.removeItem('cartItems');
  }
};

  // Get cart total function
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get cart item count function
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if item is in cart function
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  return (
    <AppContext.Provider
      value={{
        navigate,
        user,
        setUser,
        isSeller,
        setIsSeller,
        showUserLogin,
        setShowUserLogin,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        isInCart,
        isCartLoading,
        backendUrl,
        loadCartFromDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);