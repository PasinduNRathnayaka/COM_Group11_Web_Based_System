// controllers/Employee/employeeSalaryController.js
import SalaryAdjustment from '../../models/Seller/SalaryAdjustment.js';
import Employee from '../../models/Seller/Employee.js';
import Attendance from '../../models/Seller/Attendance.js';

// Helper function to safely get numeric value
const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Helper function to calculate hours between check-in and check-out
const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  try {
    const [inH, inM, inS = 0] = checkIn.split(':').map(Number);
    const [outH, outM, outS = 0] = checkOut.split(':').map(Number);

    const checkInMinutes = inH * 60 + inM + inS / 60;
    const checkOutMinutes = outH * 60 + outM + outS / 60;

    let durationMinutes = checkOutMinutes - checkInMinutes;

    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }

    const hours = durationMinutes / 60;

    if (isNaN(hours) || hours < 0 || hours > 24) {
      return 0;
    }

    return hours;
  } catch (error) {
    console.error('Error calculating working hours:', error);
    return 0;
  }
};

// Helper function to process attendance data for a specific employee and month
const processEmployeeAttendance = (attendances) => {
  const processedData = {};
  
  // Process each attendance record
  attendances.forEach(attendance => {
    const date = attendance.date;
    
    if (!processedData[date]) {
      processedData[date] = {
        date: date,
        checkIn: null,
        checkOut: null
      };
    }
    
    // Set earliest check-in and latest check-out for the day
    if (attendance.checkIn) {
      if (!processedData[date].checkIn || attendance.checkIn < processedData[date].checkIn) {
        processedData[date].checkIn = attendance.checkIn;
      }
    }
    
    if (attendance.checkOut) {
      if (!processedData[date].checkOut || attendance.checkOut > processedData[date].checkOut) {
        processedData[date].checkOut = attendance.checkOut;
      }
    }
  });
  
  // Calculate totals
  let totalHours = 0;
  let presentDays = 0;
  let completeDays = 0;
  
  Object.values(processedData).forEach(dayData => {
    if (dayData.checkIn) {
      presentDays++;
      
      if (dayData.checkOut) {
        completeDays++;
        const hours = calculateWorkingHours(dayData.checkIn, dayData.checkOut);
        totalHours += hours;
      }
    }
  });
  
  return {
    totalHours: parseFloat(totalHours.toFixed(2)),
    presentDays,
    completeDays,
    dailyRecords: Object.values(processedData).map(record => ({
      date: record.date,
      checkIn: record.checkIn || '--',
      checkOut: record.checkOut || '--',
      hours: record.checkIn && record.checkOut ? 
        parseFloat(calculateWorkingHours(record.checkIn, record.checkOut).toFixed(2)) : 0,
      status: record.checkIn && record.checkOut ? 'Complete' : 
              record.checkIn ? 'Incomplete' : 'Absent'
    }))
  };
};

// Get employee's approved salary for a specific month
export const getEmployeeSalary = async (req, res) => {
  try {
    const employeeId = req.user.id; // Get from authenticated user
    const { month } = req.query; // Expected format: '2025-01'
    
    if (!month) {
      return res.status(400).json({ 
        success: false,
        message: 'Month is required in YYYY-MM format' 
      });
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid month format. Use YYYY-MM format' 
      });
    }

    console.log(`Employee ${employeeId} requesting salary data for month ${month}`);

    // Get employee info
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Get salary adjustment record
    const salaryRecord = await SalaryAdjustment.findOne({
      employee: employeeId,
      month: month
    });

    if (!salaryRecord) {
      return res.status(404).json({ 
        success: false,
        message: 'Salary record not found for this month' 
      });
    }

    // Check if salary is approved - employees can only see approved or paid salaries
    if (salaryRecord.status !== 'approved' && salaryRecord.status !== 'paid') {
      return res.status(403).json({ 
        success: false,
        message: 'Salary is not yet approved for viewing',
        status: salaryRecord.status 
      });
    }

    // Get detailed attendance data
    const startDate = `${month}-01`;
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${daysInMonth.toString().padStart(2, '0')}`;

    const attendances = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Process attendance data
    const attendanceData = processEmployeeAttendance(attendances);

    // Calculate totals
    const totalAllowances = Object.values(salaryRecord.allowances || {}).reduce((sum, val) => sum + safeNumber(val), 0);
    const totalDeductions = Object.values(salaryRecord.deductions || {}).reduce((sum, val) => sum + safeNumber(val), 0);
    const grossSalary = safeNumber(salaryRecord.basicSalary) + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    // Prepare comprehensive report
    const report = {
      employee: {
        empId: employee.empId,
        name: employee.name || 'Unknown',
        category: employee.category || 'N/A',
        image: employee.image,
        hourlyRate: safeNumber(employee.rate) // Keep as hourlyRate for frontend compatibility
      },
      month: month,
      attendance: {
        totalHours: safeNumber(salaryRecord.totalHours),
        presentDays: safeNumber(salaryRecord.presentDays),
        completeDays: safeNumber(salaryRecord.completeDays),
        dailyRecords: attendanceData.dailyRecords
      },
      salary: {
        basicSalary: safeNumber(salaryRecord.basicSalary),
        allowances: {
          transport: safeNumber(salaryRecord.allowances?.transport),
          food: safeNumber(salaryRecord.allowances?.food),
          bonus: safeNumber(salaryRecord.allowances?.bonus),
          overtime: safeNumber(salaryRecord.allowances?.overtime),
          medical: safeNumber(salaryRecord.allowances?.medical),
          performance: safeNumber(salaryRecord.allowances?.performance),
          other: safeNumber(salaryRecord.allowances?.other)
        },
        deductions: {
          epf: safeNumber(salaryRecord.deductions?.epf),
          etf: safeNumber(salaryRecord.deductions?.etf),
          insurance: safeNumber(salaryRecord.deductions?.insurance),
          advance: safeNumber(salaryRecord.deductions?.advance),
          loan: safeNumber(salaryRecord.deductions?.loan),
          uniform: safeNumber(salaryRecord.deductions?.uniform),
          damage: safeNumber(salaryRecord.deductions?.damage),
          other: safeNumber(salaryRecord.deductions?.other)
        },
        totalAllowances: totalAllowances,
        totalDeductions: totalDeductions,
        grossSalary: grossSalary,
        netSalary: netSalary
      },
      metadata: {
        status: salaryRecord.status || 'approved',
        notes: salaryRecord.notes || '',
        modifiedBy: salaryRecord.modifiedBy,
        lastModified: salaryRecord.updatedAt,
        approvedBy: salaryRecord.approvedBy,
        approvedAt: salaryRecord.approvedAt,
        paidBy: salaryRecord.paidBy,
        paidAt: salaryRecord.paidAt
      },
      generatedAt: new Date().toISOString()
    };

    console.log(`Successfully generated salary report for employee ${employeeId}`);
    
    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch salary data',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get employee's salary history (approved/paid only)
export const getEmployeeSalaryHistory = async (req, res) => {
  try {
    const employeeId = req.user.id; // Get from authenticated user
    const { limit = 12 } = req.query;
    
    console.log(`Employee ${employeeId} requesting salary history`);

    // Get employee info
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Get salary records for the employee (only approved and paid)
    const salaryRecords = await SalaryAdjustment.find({
      employee: employeeId,
      status: { $in: ['approved', 'paid'] }
    })
    .sort({ month: -1 })
    .limit(parseInt(limit))
    .lean();

    if (!salaryRecords || salaryRecords.length === 0) {
      return res.json({
        success: true,
        data: {
          employee: {
            empId: employee.empId,
            name: employee.name || 'Unknown',
            category: employee.category || 'N/A'
          },
          history: [],
          totalRecords: 0
        }
      });
    }

    // Process each record
    const processedHistory = salaryRecords.map(record => {
      const totalAllowances = Object.values(record.allowances || {}).reduce((sum, val) => sum + safeNumber(val), 0);
      const totalDeductions = Object.values(record.deductions || {}).reduce((sum, val) => sum + safeNumber(val), 0);
      const grossSalary = safeNumber(record.basicSalary) + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      return {
        month: record.month,
        basicSalary: safeNumber(record.basicSalary),
        totalAllowances: totalAllowances,
        totalDeductions: totalDeductions,
        grossSalary: grossSalary,
        netSalary: netSalary,
        status: record.status,
        approvedAt: record.approvedAt,
        paidAt: record.paidAt,
        lastModified: record.updatedAt
      };
    });

    const response = {
      employee: {
        empId: employee.empId,
        name: employee.name || 'Unknown',
        category: employee.category || 'N/A',
        image: employee.image
      },
      history: processedHistory,
      totalRecords: processedHistory.length
    };

    console.log(`Successfully retrieved salary history for employee ${employeeId}`);
    
    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching employee salary history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch salary history',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get employee's current month salary summary
export const getCurrentMonthlySummary = async (req, res) => {
  try {
    const employeeId = req.user.id; // Get from authenticated user
    
    // Get current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    console.log(`Employee ${employeeId} requesting current month (${currentMonth}) salary summary`);

    // Get employee info
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Get salary record for current month
    const salaryRecord = await SalaryAdjustment.findOne({
      employee: employeeId,
      month: currentMonth
    });

    // If no salary record or not approved, return basic info
    if (!salaryRecord || (salaryRecord.status !== 'approved' && salaryRecord.status !== 'paid')) {
      return res.json({
        success: true,
        data: {
          employee: {
            empId: employee.empId,
            name: employee.name || 'Unknown',
            category: employee.category || 'N/A',
            image: employee.image,
            hourlyRate: safeNumber(employee.rate)
          },
          month: currentMonth,
          status: salaryRecord ? salaryRecord.status : 'not_generated',
          message: salaryRecord ? 
            `Salary for ${currentMonth} is ${salaryRecord.status} and not yet available for viewing` :
            `Salary for ${currentMonth} has not been generated yet`,
          available: false
        }
      });
    }

    // Calculate totals
    const totalAllowances = Object.values(salaryRecord.allowances || {}).reduce((sum, val) => sum + safeNumber(val), 0);
    const totalDeductions = Object.values(salaryRecord.deductions || {}).reduce((sum, val) => sum + safeNumber(val), 0);
    const grossSalary = safeNumber(salaryRecord.basicSalary) + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    const summary = {
      employee: {
        empId: employee.empId,
        name: employee.name || 'Unknown',
        category: employee.category || 'N/A',
        image: employee.image,
        hourlyRate: safeNumber(employee.rate)
      },
      month: currentMonth,
      status: salaryRecord.status,
      available: true,
      salary: {
        basicSalary: safeNumber(salaryRecord.basicSalary),
        totalAllowances: totalAllowances,
        totalDeductions: totalDeductions,
        grossSalary: grossSalary,
        netSalary: netSalary
      },
      attendance: {
        totalHours: safeNumber(salaryRecord.totalHours),
        presentDays: safeNumber(salaryRecord.presentDays),
        completeDays: safeNumber(salaryRecord.completeDays)
      },
      approvedAt: salaryRecord.approvedAt,
      paidAt: salaryRecord.paidAt
    };

    console.log(`Successfully retrieved current month salary summary for employee ${employeeId}`);
    
    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching current month salary summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch current month salary summary',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// routes/Employee/employeeSalary.routes.js
import express from 'express';
import { 
  getEmployeeSalary, 
  getEmployeeSalaryHistory, 
  getCurrentMonthlySummary 
} from '../../controllers/Employee/employeeSalaryController.js';
import { authenticateEmployee } from '../../middleware/employeeAuth.js';

const router = express.Router();

// Apply employee authentication middleware to all routes
router.use(authenticateEmployee);

// Get current month salary summary
router.get('/current-summary', getCurrentMonthlySummary);

// Get employee salary for specific month (approved only)
router.get('/monthly', getEmployeeSalary);

// Get employee salary history (approved/paid only)
router.get('/history', getEmployeeSalaryHistory);

export default router;

// middleware/employeeAuth.js
import jwt from 'jsonwebtoken';
import Employee from '../models/Seller/Employee.js';

export const authenticateEmployee = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find employee by ID
    const employee = await Employee.findById(decoded.id);
    
    if (!employee) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Employee not found.' 
      });
    }

    // Check if employee is active
    if (employee.status === 'inactive') {
      return res.status(401).json({ 
        success: false, 
        message: 'Employee account is inactive.' 
      });
    }

    // Attach employee info to request
    req.user = {
      id: employee._id,
      empId: employee.empId,
      name: employee.name,
      email: employee.email,
      category: employee.category,
      userType: 'employee'
    };
    
    next();
  } catch (error) {
    console.error('Employee authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};