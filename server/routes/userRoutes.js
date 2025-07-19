// User routes (e.g., /profile)
import express from 'express';
import { registerUser, loginUser, 
  updateUserProfile, 
  updateUserPassword, 
  getUserProfile } from '../controllers/userController.js';

import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);  // will be used in Option 2

router.get('/validate-token', protect, (req, res) => {
  res.json({ ok: true });
});

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);

export default router;
