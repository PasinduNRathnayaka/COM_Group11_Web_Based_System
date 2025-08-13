// routes/Seller/employee.routes.js - Updated with soft delete functionality
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
  deleteEmployee, // This will be updated for soft delete
  loginEmployee,
  // New forgot password functions
  requestEmployeePasswordReset,
  resetEmployeePassword,
  verifyEmployeeResetCode
} from '../../controllers/Seller/employeeController.js';
import Employee from '../../models/Seller/Employee.js';

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

// Helper function to delete image and QR files
const deleteEmployeeFiles = (employee) => {
  try {
    if (employee.image) {
      const imagePath = path.join(process.cwd(), 'uploads', employee.image.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('✅ Deleted employee image:', imagePath);
      }
    }
    
    if (employee.qrCode) {
      const qrPath = path.join(process.cwd(), 'uploads', employee.qrCode.replace('/uploads/', ''));
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
        console.log('✅ Deleted employee QR code:', qrPath);
      }
    }
  } catch (error) {
    console.error('❌ Error deleting employee files:', error);
  }
};

// Employee CRUD routes (modified for soft delete)

// POST - Create Employee
router.post('/', upload.single('image'), createEmployee);

// GET - Get all ACTIVE employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.findActive().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error('❌ Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET - Get employees in recycle bin
router.get('/recycle-bin', async (req, res) => {
  try {
    const deletedEmployees = await Employee.findDeleted().sort({ deletedAt: -1 });
    res.json(deletedEmployees);
  } catch (err) {
    console.error('❌ Error fetching deleted employees:', err);
    res.status(500).json({ error: 'Failed to fetch deleted employees' });
  }
});

// GET - Get ACTIVE employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error('❌ Error fetching employee:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT - Update Employee
router.put('/:id', upload.single('image'), updateEmployee);

// DELETE - SOFT DELETE an employee (Move to Recycle Bin)
router.delete('/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { deletedBy, reason } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Soft delete the employee
    await employee.softDelete(deletedBy || 'Unknown', reason);

    res.json({ 
      message: "Employee moved to recycle bin successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        empId: employee.empId,
        deletedAt: employee.deletedAt,
        deletedBy: employee.deletedBy
      }
    });
  } catch (err) {
    console.error("❌ Failed to move employee to recycle bin:", err);
    res.status(500).json({ error: "Failed to move employee to recycle bin" });
  }
});

// POST - RESTORE an employee from Recycle Bin
router.post('/:id/restore', async (req, res) => {
  try {
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.isDeleted) {
      return res.status(404).json({ error: "Employee not found in recycle bin" });
    }

    // Restore the employee
    await employee.restore();

    res.json({ 
      message: "Employee restored successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        empId: employee.empId,
        restoredAt: new Date()
      }
    });
  } catch (err) {
    console.error("❌ Failed to restore employee:", err);
    res.status(500).json({ error: "Failed to restore employee" });
  }
});

// DELETE - PERMANENTLY DELETE an employee from Recycle Bin
router.delete('/:id/permanent', async (req, res) => {
  try {
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.isDeleted) {
      return res.status(404).json({ error: "Employee not found in recycle bin" });
    }

    // Delete associated files
    deleteEmployeeFiles(employee);

    await Employee.findByIdAndDelete(employeeId);

    res.json({ message: "Employee permanently deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to permanently delete employee:", err);
    res.status(500).json({ error: "Failed to permanently delete employee" });
  }
});

// POST - Clear entire employee recycle bin
router.post('/recycle-bin/clear', async (req, res) => {
  try {
    const deletedEmployees = await Employee.findDeleted();
    
    // Delete all associated files
    for (const employee of deletedEmployees) {
      deleteEmployeeFiles(employee);
    }

    // Permanently delete all employees in recycle bin
    const result = await Employee.deleteMany({ isDeleted: true });

    res.json({ 
      message: `${result.deletedCount} employees permanently deleted from recycle bin`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Failed to clear employee recycle bin:", err);
    res.status(500).json({ error: "Failed to clear employee recycle bin" });
  }
});

// Authentication routes
router.post('/login', loginEmployee);

// 🔑 NEW: Forgot password routes for employees (no authentication needed)
router.post('/forgot-password', requestEmployeePasswordReset);
router.post('/verify-reset-code', verifyEmployeeResetCode);
router.post('/reset-password', resetEmployeePassword);

export default router;