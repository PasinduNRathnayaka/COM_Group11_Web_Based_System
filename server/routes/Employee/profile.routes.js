// routes/Employee/profile.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  updateProfileImage,
  changePassword,
  getEmployeeDashboard
} from '../../controllers/Employee/profileController.js';
import { authenticateEmployee, requireEmployeeRole } from '../../middlewares/employeeAuth.js';

const router = express.Router();

// Setup file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const employeeUploadDir = path.resolve(__dirname, '../../uploads/employees');

// Ensure upload directory exists
if (!fs.existsSync(employeeUploadDir)) {
  fs.mkdirSync(employeeUploadDir, { recursive: true });
  console.log('✅ Created employee uploads directory');
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, employeeUploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with employee ID and timestamp
    const empId = req.user?.empId || 'employee';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${empId}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Configure multer with file size limit (5MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateEmployee);
router.use(requireEmployeeRole);

// Profile routes

// GET /api/employee-profile/profile/me - Get current employee's profile
router.get('/profile/me', getEmployeeProfile);

// GET /api/employee-profile/dashboard - Get employee dashboard data
router.get('/dashboard', getEmployeeDashboard);

// PUT /api/employee-profile/profile/me - Update employee profile (with optional image)
router.put('/profile/me', upload.single('image'), handleMulterError, updateEmployeeProfile);

// PUT /api/employee-profile/profile/image - Update profile image only
router.put('/profile/image', upload.single('image'), handleMulterError, updateProfileImage);

// PUT /api/employee-profile/profile/password - Change password
router.put('/profile/password', changePassword);

// GET /api/employee-profile/profile/verify - Verify authentication (for frontend)
router.get('/profile/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication verified',
    user: {
      id: req.user.id,
      empId: req.user.empId,
      name: req.user.name,
      email: req.user.email,
      category: req.user.category,
      role: req.user.role
    }
  });
});

// Error handling for the entire router
router.use((error, req, res, next) => {
  console.error('Employee profile route error:', error);
  
  if (error.code === 11000) {
    // Duplicate key error (MongoDB)
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    });
  }
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. ')
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred'
  });
});

export default router;