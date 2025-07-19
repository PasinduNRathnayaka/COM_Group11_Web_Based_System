import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

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
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, qty) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
