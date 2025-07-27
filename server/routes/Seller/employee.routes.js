// routes/Seller/employee.routes.js - Updated with forgot password routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  // New forgot password functions
  requestEmployeePasswordReset,
  resetEmployeePassword,
  verifyEmployeeResetCode
} from '../../controllers/Seller/employeeController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const employeeUploadDir = path.resolve(__dirname, '../../uploads/employees');

if (!fs.existsSync(employeeUploadDir)) {
  fs.mkdirSync(employeeUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, employeeUploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Employee CRUD routes
router.post('/', upload.single('image'), createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', upload.single('image'), updateEmployee);
router.delete('/:id', deleteEmployee);

// Authentication routes
router.post('/login', loginEmployee);

// 🔑 NEW: Forgot password routes for employees (no authentication needed)
router.post('/forgot-password', requestEmployeePasswordReset);
router.post('/verify-reset-code', verifyEmployeeResetCode);
router.post('/reset-password', resetEmployeePassword);

export default router;