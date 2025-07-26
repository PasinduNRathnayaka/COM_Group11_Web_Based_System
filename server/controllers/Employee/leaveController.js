import Leave from '../../models/Employee/Leave.js';
import Announcement from '../../models/Employee/Announcement.js';
import Employee from '../../models/Employee/Employee.js';

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, type, from, to, days, applyTo, reason } = req.body;

    // Validate required fields
    if (!employeeId || !type || !from || !to || !days || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required (employeeId, type, from, to, days, reason)' 
      });
    }

    // Find employee by empId to validate existence and get name
    const employee = await Employee.findOne({ empId: employeeId });
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found with this ID' 
      });
    }

    // Validate dates
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (fromDate > toDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'From date cannot be after To date' 
      });
    }

    // Create leave application
    const leaveApplication = new Leave({
      employeeId,
      employeeName: employee.name,
      type,
      from: fromDate,
      to: toDate,
      days: parseInt(days),
      applyTo: applyTo || 'Owner',
      reason
    });

    // Save to MongoDB (auto-updates database)
    await leaveApplication.save();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leaveApplication
    });

  } catch (error) {
    console.error('Error applying leave:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get leave statistics for an employee
export const getLeaveStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    // Verify employee exists
    const employee = await Employee.findOne({ empId: employeeId });
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Calculate current year stats
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get approved leaves for current year from MongoDB
    const approvedLeaves = await Leave.find({
      employeeId,
      status: 'approved',
      from: { $gte: yearStart, $lte: yearEnd }
    });

    // Calculate stats
    let leaveDays = 0;
    let halfDays = 0;

    approvedLeaves.forEach(leave => {
      if (leave.type === 'full') {
        leaveDays += leave.days;
      } else if (leave.type === 'half') {
        halfDays += leave.days;
      }
    });

    // Calculate worked days (assuming 22 working days per month)
    const totalWorkingDays = 22 * 12; // 264 days per year
    const workedDays = totalWorkingDays - leaveDays - (halfDays * 0.5);

    res.status(200).json({
      success: true,
      data: {
        leaveDays,
        workedDays: Math.max(0, Math.floor(workedDays)),
        halfDays
      }
    });

  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get all active announcements
export const getAnnouncements = async (req, res) => {
  try {
    // Fetch from MongoDB
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get employee's leave history
export const getLeaveHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    // Verify employee exists
    const employee = await Employee.findOne({ empId: employeeId });
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Get all leaves for this employee from MongoDB
    const leaves = await Leave.find({ employeeId })
      .sort({ appliedDate: -1 });

    res.status(200).json({
      success: true,
      data: leaves
    });

  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get employee profile (for future login integration)
export const getEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({ empId: employeeId }).select('-password');
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update employee profile (auto-updates MongoDB)
export const updateEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    // Don't allow updating sensitive fields
    delete updates.empId;
    delete updates.password;
    delete updates.username;

    const employee = await Employee.findOneAndUpdate(
      { empId: employeeId },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: employee
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Create announcement (for admin/owner)
export const createAnnouncement = async (req, res) => {
  try {
    const { message, createdBy } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    const announcement = new Announcement({
      message,
      createdBy: createdBy || 'Owner'
    });

    // Save to MongoDB
    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });

  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};