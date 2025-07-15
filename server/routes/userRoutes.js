// User routes (e.g., /profile)
import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);  // will be used in Option 2

export default router;
