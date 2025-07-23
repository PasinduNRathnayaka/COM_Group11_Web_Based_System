// routes/Seller/salary.routes.js
import express from 'express';
import { getMonthlySalary, getSalaryReport } from '../../controllers/Seller/salaryController.js';

const router = express.Router();

// Get monthly salary summary
router.get('/monthly', getMonthlySalary);

// Get detailed salary report for PDF generation
router.get('/report', getSalaryReport);

export default router;