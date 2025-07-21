// routes/Seller/attendance.routes.js
import express from 'express';
import {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getMonthlySalaryReport,
  getMonthlySummary,
} from '../../controllers/Seller/attendanceController.js';

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/', getAllAttendance);
router.get('/employee/:empId', getAttendanceByEmployee);
router.get('/monthly-salary', getMonthlySalaryReport); // 🆕 Add this line
router.get('/monthly-summary', getMonthlySummary);

export default router;
