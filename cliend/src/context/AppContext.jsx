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

  // Wrapped setter: keeps localStorage in sync
  const setUser = (newUser) => {
    _setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', newUser.token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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

        // Optional: server-side token validation
        await axios.get('/api/user/validate-token', {
          headers: { Authorization: `Bearer ${initialUser.token}` },
        });

        // ✅ UPDATE: Fetch fresh user profile data on app load
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
        }

      } catch (err) {
        console.warn('🔐 Token invalid/expired – logging out');
        setUser(null);  // log out user if invalid
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
        const savedCartItems = localStorage.getItem('cartItems');
        if (savedCartItems) {
          const parsedItems = JSON.parse(savedCartItems);
          if (Array.isArray(parsedItems)) {
            _setCartItems(parsedItems);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cartItems');
      } finally {
        setIsCartLoading(false);
      }
    };

    loadCartFromStorage();
  }, []);

  // Wrapped cart setter: keeps localStorage in sync
  const setCartItems = (newCartItems) => {
    if (typeof newCartItems === 'function') {
      _setCartItems(prevItems => {
        const updatedItems = newCartItems(prevItems);
        if (!isCartLoading) {
          localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        }
        return updatedItems;
      });
    } else {
      _setCartItems(newCartItems);
      if (!isCartLoading) {
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      }
    }
  };

  // Enhanced addToCart function
  const addToCart = (product, quantity = 1) => {
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
  };

  // Remove item from cart function
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update item quantity function
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear entire cart function
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);