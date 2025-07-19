// User routes (e.g., /profile)
import express from 'express';
import { registerUser, loginUser, 
  updateUserProfile, 
  updateUserPassword,
  updateProfileImage, 
  getUserProfile,
  upload } from '../controllers/userController.js';

import { protect } from '../middlewares/authMiddleware.js';

//import multer from 'multer';

//const storage = multer.memoryStorage(); // or diskStorage({...}) if saving to disk
//const upload = multer({ storage });

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);  // will be used in Option 2

router.get('/validate-token', protect, (req, res) => {
  res.json({ ok: true });
});

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile-image', protect, upload.single('profileImage'), updateProfileImage);
router.put('/password', protect, updateUserPassword);

export default router;
