// routes/leave.routes.js
import express from 'express';
import Leave from '../../models/Employee/Leave.model.js';
import Employee from '../../models/Seller/Employee.js';

const router = express.Router();

// Employee Routes

// POST /api/leaves/apply - Employee applies for leave
router.post('/apply', async (req, res) => {
  try {
    const { 
      employeeId, 
      leaveType, 
      startDate, 
      endDate, 
      reason 
    } = req.body;

    // Validate required fields
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ 
        success: false, 
        error: 'Leave start date cannot be in the past' 
      });
    }

    if (end < start) {
      return res.status(400).json({ 
        success: false, 
        error: 'Leave end date must be after start date' 
      });
    }

    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        error: 'Employee not found' 
      });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employeeId: employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have a leave application for overlapping dates' 
      });
    }

    // Create new leave application
    const newLeave = new Leave({
      employeeId,
      employeeName: employee.name,
      employeeEmpId: employee.empId,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim()
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: newLeave
    });

  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit leave application' 
    });
  }
});

// GET /api/leaves/employee/:employeeId - Get employee's leave history
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, limit = 50, page = 1 } = req.query;

    let query = { employeeId };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .sort({ appliedDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Leave.countDocuments(query);

    res.json({
      success: true,
      leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching employee leaves:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leave history' 
    });
  }
});

// Admin Routes

// GET /api/leaves/admin/all - Get all leave applications for admin
router.get('/admin/all', async (req, res) => {
  try {
    const { status, employeeId, limit = 50, page = 1, sortBy = 'appliedDate', sortOrder = 'desc' } = req.query;

    let query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (employeeId) {
      query.employeeId = employeeId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const leaves = await Leave.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('employeeId', 'name empId email image department');

    const total = await Leave.countDocuments(query);

    // Get summary statistics
    const stats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: total
    };

    stats.forEach(stat => {
      summary[stat._id] = stat.count;
    });

    res.json({
      success: true,
      leaves,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leave applications' 
    });
  }
});

// PUT /api/leaves/admin/review/:leaveId - Admin reviews leave application
router.put('/admin/review/:leaveId', async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, adminComment, reviewedBy } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status must be either approved or rejected' 
      });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leave application not found' 
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Leave application has already been reviewed' 
      });
    }

    leave.status = status;
    leave.adminComment = adminComment?.trim() || '';
    leave.reviewedDate = new Date();
    leave.reviewedBy = reviewedBy || 'Admin';

    await leave.save();

    res.json({
      success: true,
      message: `Leave application ${status} successfully`,
      leave
    });

  } catch (error) {
    console.error('Error reviewing leave application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to review leave application' 
    });
  }
});

// GET /api/leaves/admin/stats - Get leave statistics for dashboard
router.get('/admin/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        appliedDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const stats = await Leave.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            status: '$status',
            month: { $month: '$appliedDate' },
            year: { $year: '$appliedDate' }
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      },
      {
        $group: {
          _id: '$_id.status',
          count: { $sum: '$count' },
          totalDays: { $sum: '$totalDays' },
          byMonth: {
            $push: {
              month: '$_id.month',
              year: '$_id.year',
              count: '$count'
            }
          }
        }
      }
    ]);

    const summary = {
      pending: { count: 0, totalDays: 0 },
      approved: { count: 0, totalDays: 0 },
      rejected: { count: 0, totalDays: 0 },
      total: { count: 0, totalDays: 0 }
    };

    stats.forEach(stat => {
      summary[stat._id] = {
        count: stat.count,
        totalDays: stat.totalDays,
        byMonth: stat.byMonth
      };
      summary.total.count += stat.count;
      summary.total.totalDays += stat.totalDays;
    });

    res.json({
      success: true,
      stats: summary
    });

  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leave statistics' 
    });
  }
});

// DELETE /api/leaves/:leaveId - Delete/Cancel leave application (only if pending)
router.delete('/:leaveId', async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leave application not found' 
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel leave application that has been reviewed' 
      });
    }

    await Leave.findByIdAndDelete(leaveId);

    res.json({
      success: true,
      message: 'Leave application cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling leave application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel leave application' 
    });
  }
});

export default router;