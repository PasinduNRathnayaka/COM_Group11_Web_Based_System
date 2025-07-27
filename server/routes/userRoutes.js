// routes/userRoutes.js - Updated with forgot password routes
import express from 'express';
import { 
  registerUser, 
  loginUser, 
  updateUserProfile, 
  updateUserPassword,
  updateProfileImage, 
  getUserProfile,
  upload,
  // New forgot password functions
  requestPasswordReset,
  resetPassword,
  verifyResetCode,
  // Cart functions
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/userController.js';

import { protect, handleMulterError } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// 🔑 NEW: Forgot password routes (no authentication needed)
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Token validation
router.get('/validate-token', protect, (req, res) => {
  res.json({ ok: true });
});

// Profile routes (protected)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile-image', protect, upload.single('profileImage'), handleMulterError, updateProfileImage);
router.put('/password', protect, updateUserPassword);

// Cart routes (protected)
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.put('/cart', protect, updateCartItem);
router.delete('/cart/:productId', protect, removeFromCart);
router.delete('/cart', protect, clearCart);

export default router;