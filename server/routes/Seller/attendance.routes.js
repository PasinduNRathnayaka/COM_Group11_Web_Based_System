import express from 'express';
import {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
} from '../../controllers/Seller/attendanceController.js';

const router = express.Router();

// POST /api/attendance/mark  -> Mark check-in/check-out
router.post('/mark', markAttendance);

// GET /api/attendance         -> Get all or filter by date (?date=YYYY-MM-DD)
router.get('/', getAllAttendance);

// GET /api/attendance/employee/:empId -> Get full attendance history of specific employee
router.get('/employee/:empId', getAttendanceByEmployee);

export default router;
