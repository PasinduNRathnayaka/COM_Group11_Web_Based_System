// routes/Seller/salary.routes.js
import express from 'express';
import { 
  getMonthlySalary, 
  getSalaryReport, 
  saveSalaryAdjustments,
  getIndividualSalaryReport,
  approveSalary,
  markSalaryAsPaid
} from '../../controllers/Seller/salaryController.js';

const router = express.Router();

// Get monthly salary summary with adjustments
router.get('/monthly', getMonthlySalary);
router.get('/monthly-salary', getMonthlySalary); // Keep existing endpoint for compatibility

// Get detailed salary report for all employees
router.get('/report', getSalaryReport);

// Get individual employee salary report
router.get('/individual/:employeeId', getIndividualSalaryReport);

// Save or update salary adjustments
router.post('/adjustments', saveSalaryAdjustments);

// Approve salary
router.post('/approve', approveSalary);

// Mark salary as paid
router.post('/mark-paid', markSalaryAsPaid);

export default router;