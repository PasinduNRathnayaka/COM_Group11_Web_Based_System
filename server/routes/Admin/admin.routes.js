// routes/Admin/admin.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getDashboardStats,
  // New password reset functions
  requestAdminPasswordReset,
  verifyAdminResetCode,
  resetAdminPassword
} from '../../controllers/Admin/adminController.js';
import { adminAuth } from '../../middlewares/adminAuth.js';

const router = express.Router();

// Setup file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminUploadDir = path.resolve(__dirname, '../../uploads/admin');

// Create admin upload directory if it doesn't exist
if (!fs.existsSync(adminUploadDir)) {
  fs.mkdirSync(adminUploadDir, { recursive: true });
}

// Multer configuration for admin avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, adminUploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `admin-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes (no authentication required)
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// 🔐 NEW: Password reset routes for admins (no authentication needed)
router.post('/forgot-password', requestAdminPasswordReset);
router.post('/verify-reset-code', verifyAdminResetCode);
router.post('/reset-password', resetAdminPassword);

// Protected routes (authentication required)
router.use(adminAuth); // Apply auth middleware to all routes below

router.get('/profile', getAdminProfile);
router.put('/profile', upload.single('avatar'), updateAdminProfile);
router.put('/change-password', changeAdminPassword);
router.get('/dashboard-stats', getDashboardStats);

export default router;