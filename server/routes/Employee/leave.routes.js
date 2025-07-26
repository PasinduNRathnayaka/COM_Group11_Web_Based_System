import express from 'express';
import { 
  applyLeave, 
  getLeaveStats, 
  getAnnouncements, 
  getLeaveHistory,
  getEmployeeProfile,
  updateEmployeeProfile,
  createAnnouncement 
} from '../../controllers/Employee/leaveController.js';

const router = express.Router();

// Employee routes (all use empId for identification)
router.post('/apply-leave', applyLeave);
router.get('/leave-stats/:employeeId', getLeaveStats);
router.get('/leave-history/:employeeId', getLeaveHistory);
router.get('/profile/:employeeId', getEmployeeProfile);
router.put('/profile/:employeeId', updateEmployeeProfile);
router.get('/announcements', getAnnouncements);

// Admin routes
router.post('/announcements', createAnnouncement);

export default router;