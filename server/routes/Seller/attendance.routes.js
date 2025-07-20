import express from 'express';
import { markAttendance, getAllAttendance } from '../../controllers/Seller/attendanceController.js';

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/', getAllAttendance);

export default router;
