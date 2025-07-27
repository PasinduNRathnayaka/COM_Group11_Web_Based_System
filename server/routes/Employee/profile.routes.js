// routes/Employee/profile.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect as verifyToken, isEmployee } from '../../middlewares/authMiddleware.js';

import { 
  getEmployeeProfile, 
  updateEmployeeProfile 
} from '../../controllers/Seller/employeeController.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/employees';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.employee.empId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Profile routes - all require authentication
router.use(verifyToken);
router.use(isEmployee);

// GET /api/employee/profile - Get current employee profile
router.get('/profile', getEmployeeProfile);

// PUT /api/employee/profile - Update current employee profile
router.put('/profile', upload.single('image'), updateEmployeeProfile);

export default router;