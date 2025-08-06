import express from 'express';
import { 
  getEmployeeProfile, 
  getMyProfile, 
  updateEmployeeProfile,
  uploadProfileImage 
} from '../../controllers/Employee/profileController.js';
import { protectEmployee } from '../../middlewares/employeeAuthMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer configuration for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.empId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Please upload only image files'));
    }
  }
});

// Routes
router.get('/profile/me', protectEmployee, getMyProfile);
router.get('/:empId', protectEmployee, getEmployeeProfile);
router.put('/profile/update', protectEmployee, updateEmployeeProfile);
router.post('/profile/upload-image', protectEmployee, upload.single('profileImage'), uploadProfileImage);

export default router;