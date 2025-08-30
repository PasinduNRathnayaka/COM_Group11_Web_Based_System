// routes/Employee/employeeProfile.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  changeEmployeePassword,
  getEmployeeDashboardStats
} from '../../controllers/Employee/employeeProfileController.js';
import { authenticateEmployee } from '../../middleware/employeeAuth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const employeeUploadDir = path.resolve(__dirname, '../../uploads/employees');

// Ensure upload directory exists
if (!fs.existsSync(employeeUploadDir)) {
  fs.mkdirSync(employeeUploadDir, { recursive: true });
}

// Configure multer for employee profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, employeeUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `employee-${req.employee.empId}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Apply authentication middleware to all routes
router.use(authenticateEmployee);

// GET /api/employee-profile/profile/me - Get current employee's profile
router.get('/profile/me', getEmployeeProfile);

// PUT /api/employee-profile/profile/me - Update current employee's profile
router.put('/profile/me', upload.single('image'), (req, res, next) => {
  // Handle multer errors
  if (req.fileValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only images are allowed.'
    });
  }
  next();
}, updateEmployeeProfile);

// PUT /api/employee-profile/change-password - Change employee password
router.put('/change-password', changeEmployeePassword);

// GET /api/employee-profile/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', getEmployeeDashboardStats);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }

  next(error);
});

export default router;