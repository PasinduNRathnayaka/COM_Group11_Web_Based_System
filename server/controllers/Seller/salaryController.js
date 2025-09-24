// controllers/Seller/salaryController.js
import Attendance from '../../models/Seller/Attendance.js';
import Employee from '../../models/Seller/Employee.js';
import SalaryAdjustment from '../../models/Seller/SalaryAdjustment.js';

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

// Helper function to safely get numeric value
const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
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
    dailyRecords: Object.values(processedData)
  };
};

export const getMonthlySalary = async (req, res) => {
  try {
    const { month } = req.query; // Expected format: '2025-01'
    
    if (!month) {
      return res.status(400).json({ message: 'Month is required in YYYY-MM format' });
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM format' });
    }

    // Create date range for the month
    const startDate = `${month}-01`;
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${daysInMonth.toString().padStart(2, '0')}`;

    console.log(`Fetching salary data for ${month}: ${startDate} to ${endDate}`);

    // Fetch all active employees
    const employees = await Employee.find({ 
      $or: [
        { status: { $exists: false } }, // Documents without status field are considered active
        { status: { $ne: 'inactive' } }, // Documents with status not equal to 'inactive'
        { status: 'active' } // Documents with status 'active'
      ]
    }).sort({ empId: 1 });
    
    if (!employees || employees.length === 0) {
      console.log('No active employees found');
      return res.json([]);
    }

    console.log(`Found ${employees.length} active employees`);

    const result = [];

    for (const employee of employees) {
      try {
        console.log(`Processing employee: ${employee.empId} - ${employee.name}`);

        // Get attendance data for the month
        const attendances = await Attendance.find({
          employee: employee._id,
          date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        console.log(`Found ${attendances.length} attendance records for ${employee.empId}`);

        // Process attendance data
        const attendanceData = processEmployeeAttendance(attendances);

        // Calculate basic salary based on present days and daily rate
        // Using the 'rate' field as daily rate
        const dailyRate = safeNumber(employee.rate) || 0;
        const calculatedSalary = attendanceData.presentDays * dailyRate;

        console.log(`Employee ${employee.empId}: Present Days: ${attendanceData.presentDays}, Daily Rate: ${dailyRate}, Basic Salary: ${calculatedSalary}`);

        // Check for existing salary adjustment record
        let salaryAdjustment = await SalaryAdjustment.findOne({
          employee: employee._id,
          month: month
        });

        // If no adjustment record exists, create default one
        if (!salaryAdjustment) {
          console.log(`Creating new salary adjustment for ${employee.empId}`);
          salaryAdjustment = new SalaryAdjustment({
            employee: employee._id,
            empId: employee.empId,
            month: month,
            basicSalary: calculatedSalary,
            totalHours: attendanceData.totalHours,
            presentDays: attendanceData.presentDays,
            completeDays: attendanceData.completeDays,
            allowances: {
              transport: 0,
              food: 0,
              bonus: 0,
              overtime: 0,
              medical: 0,
              performance: 0,
              other: 0
            },
            deductions: {
              epf: 0,
              etf: 0,
              insurance: 0,
              advance: 0,
              loan: 0,
              uniform: 0,
              damage: 0,
              other: 0
            },
            modifiedBy: 'System Auto-Generated'
          });
          await salaryAdjustment.save();
          console.log(`Created salary adjustment for ${employee.empId}`);
        } else {
          console.log(`Updating existing salary adjustment for ${employee.empId}`);
          // Update attendance data and basic salary in existing record
          salaryAdjustment.totalHours = attendanceData.totalHours;
          salaryAdjustment.presentDays = attendanceData.presentDays;
          salaryAdjustment.completeDays = attendanceData.completeDays;
          salaryAdjustment.basicSalary = calculatedSalary;
          await salaryAdjustment.save();
        }

        // Ensure allowances and deductions have proper structure
        const allowances = salaryAdjustment.allowances || {};
        const deductions = salaryAdjustment.deductions || {};

        // Calculate totals
        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + safeNumber(val), 0);
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + safeNumber(val), 0);
        const grossSalary = calculatedSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        // Prepare response data
        result.push({
          _id: employee._id,
          empId: employee.empId,
          name: employee.name || 'Unknown',
          category: employee.category || 'N/A',
          image: employee.image,
          dailyRate: dailyRate,
          totalHours: safeNumber(salaryAdjustment.totalHours),
          presentDays: safeNumber(salaryAdjustment.presentDays),
          completeDays: safeNumber(salaryAdjustment.completeDays),
          calculatedSalary: safeNumber(salaryAdjustment.basicSalary),
          totalAllowances: totalAllowances,
          totalDeductions: totalDeductions,
          grossSalary: grossSalary,
          finalSalary: netSalary, // This is the net salary
          salaryAdjustments: {
            allowances: {
              transport: safeNumber(allowances.transport),
              food: safeNumber(allowances.food),
              bonus: safeNumber(allowances.bonus),
              overtime: safeNumber(allowances.overtime),
              medical: safeNumber(allowances.medical),
              performance: safeNumber(allowances.performance),
              other: safeNumber(allowances.other)
            },
            deductions: {
              epf: safeNumber(deductions.epf),
              etf: safeNumber(deductions.etf),
              insurance: safeNumber(deductions.insurance),
              advance: safeNumber(deductions.advance),
              loan: safeNumber(deductions.loan),
              uniform: safeNumber(deductions.uniform),
              damage: safeNumber(deductions.damage),
              other: safeNumber(deductions.other)
            },
            notes: salaryAdjustment.notes || ''
          },
          status: salaryAdjustment.status || 'draft',
          lastModified: salaryAdjustment.updatedAt
        });

        console.log(`Successfully processed employee ${employee.empId}`);
      } catch (empError) {
        console.error(`Error processing employee ${employee.empId}:`, empError);
        
        // Add employee with basic info even if calculation fails
        result.push({
          _id: employee._id,
          empId: employee.empId,
          name: employee.name || 'Unknown',
          category: employee.category || 'N/A',
          image: employee.image,
          dailyRate: safeNumber(employee.rate),
          totalHours: 0,
          presentDays: 0,
          completeDays: 0,
          calculatedSalary: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          grossSalary: 0,
          finalSalary: 0,
          salaryAdjustments: {
            allowances: {
              transport: 0, food: 0, bonus: 0, overtime: 0,
              medical: 0, performance: 0, other: 0
            },
            deductions: {
              epf: 0, etf: 0, insurance: 0, advance: 0,
              loan: 0, uniform: 0, damage: 0, other: 0
            },
            notes: `Error calculating salary: ${empError.message}`
          },
          status: 'error',
          lastModified: new Date()
        });
        
        continue;
      }
    }

    // Sort by employee ID
    result.sort((a, b) => {
      if (!a.empId || !b.empId) return 0;
      return a.empId.localeCompare(b.empId);
    });

    console.log(`Successfully processed ${result.length} employees for salary calculation`);
    res.json(result);
  } catch (error) {
    console.error('Error calculating monthly salary:', error);
    res.status(500).json({ 
      message: 'Failed to calculate monthly salary',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Save or update salary adjustments
export const saveSalaryAdjustments = async (req, res) => {
  try {
    const { employeeId, month, adjustments, modifiedBy = 'Admin' } = req.body;

    if (!employeeId || !month || !adjustments) {
      return res.status(400).json({ 
        message: 'Employee ID, month, and adjustments are required' 
      });
    }

    console.log(`Saving salary adjustments for employee ${employeeId}, month ${month}`, adjustments);

    // Find salary adjustment record
    let salaryAdjustment = await SalaryAdjustment.findOne({
      employee: employeeId,
      month: month
    });

    if (!salaryAdjustment) {
      // Get employee info for new record
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      return res.status(404).json({ 
        message: 'Salary record not found. Please refresh the salary data first.' 
      });
    }

    // Update adjustment data
    if (adjustments.allowances) {
      salaryAdjustment.allowances = { 
        transport: safeNumber(adjustments.allowances.transport),
        food: safeNumber(adjustments.allowances.food),
        bonus: safeNumber(adjustments.allowances.bonus),
        overtime: safeNumber(adjustments.allowances.overtime),
        medical: safeNumber(adjustments.allowances.medical),
        performance: safeNumber(adjustments.allowances.performance),
        other: safeNumber(adjustments.allowances.other)
      };
    }
    
    if (adjustments.deductions) {
      salaryAdjustment.deductions = { 
        epf: safeNumber(adjustments.deductions.epf),
        etf: safeNumber(adjustments.deductions.etf),
        insurance: safeNumber(adjustments.deductions.insurance),
        advance: safeNumber(adjustments.deductions.advance),
        loan: safeNumber(adjustments.deductions.loan),
        uniform: safeNumber(adjustments.deductions.uniform),
        damage: safeNumber(adjustments.deductions.damage),
        other: safeNumber(adjustments.deductions.other)
      };
    }

    if (adjustments.notes !== undefined) {
      salaryAdjustment.notes = adjustments.notes;
    }

    salaryAdjustment.modifiedBy = modifiedBy;

    // Save the record
    await salaryAdjustment.save();

    // Calculate totals manually to ensure accuracy
    const totalAllowances = Object.values(salaryAdjustment.allowances || {}).reduce((sum, val) => sum + safeNumber(val), 0);
    const totalDeductions = Object.values(salaryAdjustment.deductions || {}).reduce((sum, val) => sum + safeNumber(val), 0);
    const grossSalary = safeNumber(salaryAdjustment.basicSalary) + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    const responseData = {
      empId: salaryAdjustment.empId,
      basicSalary: safeNumber(salaryAdjustment.basicSalary),
      totalAllowances: totalAllowances,
      totalDeductions: totalDeductions,
      grossSalary: grossSalary,
      finalSalary: netSalary,
      allowances: {
        transport: safeNumber(salaryAdjustment.allowances?.transport),
        food: safeNumber(salaryAdjustment.allowances?.food),
        bonus: safeNumber(salaryAdjustment.allowances?.bonus),
        overtime: safeNumber(salaryAdjustment.allowances?.overtime),
        medical: safeNumber(salaryAdjustment.allowances?.medical),
        performance: safeNumber(salaryAdjustment.allowances?.performance),
        other: safeNumber(salaryAdjustment.allowances?.other)
      },
      deductions: {
        epf: safeNumber(salaryAdjustment.deductions?.epf),
        etf: safeNumber(salaryAdjustment.deductions?.etf),
        insurance: safeNumber(salaryAdjustment.deductions?.insurance),
        advance: safeNumber(salaryAdjustment.deductions?.advance),
        loan: safeNumber(salaryAdjustment.deductions?.loan),
        uniform: safeNumber(salaryAdjustment.deductions?.uniform),
        damage: safeNumber(salaryAdjustment.deductions?.damage),
        other: safeNumber(salaryAdjustment.deductions?.other)
      },
      notes: salaryAdjustment.notes || '',
      status: salaryAdjustment.status || 'draft',
      lastModified: salaryAdjustment.updatedAt
    };

    console.log(`Successfully saved salary adjustments for employee ${employeeId}`);

    res.json({
      message: 'Salary adjustments saved successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error saving salary adjustments:', error);
    res.status(500).json({ 
      message: 'Failed to save salary adjustments',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get individual employee salary report
export const getIndividualSalaryReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month is required' });
    }

    console.log(`Generating individual salary report for employee ${employeeId}, month ${month}`);

    // Get employee info
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get salary adjustment record
    const salaryRecord = await SalaryAdjustment.findOne({
      employee: employeeId,
      month: month
    });

    if (!salaryRecord) {
      return res.status(404).json({ 
        message: 'Salary record not found for this month' 
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
        dailyRecords: attendanceData.dailyRecords.map(record => ({
          date: record.date,
          checkIn: record.checkIn || '--',
          checkOut: record.checkOut || '--',
          hours: record.checkIn && record.checkOut ? 
            parseFloat(calculateWorkingHours(record.checkIn, record.checkOut).toFixed(2)) : 0,
          status: record.checkIn && record.checkOut ? 'Complete' : 
                  record.checkIn ? 'Incomplete' : 'Absent'
        }))
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
        status: salaryRecord.status || 'draft',
        notes: salaryRecord.notes || '',
        modifiedBy: salaryRecord.modifiedBy,
        lastModified: salaryRecord.updatedAt,
        approvedBy: salaryRecord.approvedBy,
        approvedAt: salaryRecord.approvedAt
      },
      generatedAt: new Date().toISOString()
    };

    console.log(`Successfully generated individual salary report for employee ${employeeId}`);
    res.json(report);

  } catch (error) {
    console.error('Error generating individual salary report:', error);
    res.status(500).json({ 
      message: 'Failed to generate salary report',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get comprehensive salary report for all employees
export const getSalaryReport = async (req, res) => {
  try {
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ message: 'Month is required in YYYY-MM format' });
    }

    console.log(`Generating comprehensive salary report for month ${month}`);

    // Get all salary records for the month
    const salaryRecords = await SalaryAdjustment.find({ month })
      .populate('employee', 'empId name category image rate')
      .sort({ empId: 1 });

    if (!salaryRecords || salaryRecords.length === 0) {
      return res.json({
        month: month,
        generatedAt: new Date().toISOString(),
        summary: {
          totalEmployees: 0,
          totalBasicSalary: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          totalNetSalary: 0,
          averageSalary: 0
        },
        employees: []
      });
    }

    // Calculate summary statistics
    let totalEmployees = salaryRecords.length;
    let totalBasicSalary = 0;
    let totalAllowances = 0;
    let totalDeductions = 0;
    let totalNetSalary = 0;

    const processedReports = salaryRecords.map(record => {
      const basicSalary = safeNumber(record.basicSalary);
      const allowances = Object.values(record.allowances || {}).reduce((sum, val) => sum + safeNumber(val), 0);
      const deductions = Object.values(record.deductions || {}).reduce((sum, val) => sum + safeNumber(val), 0);
      const grossSalary = basicSalary + allowances;
      const netSalary = grossSalary - deductions;

      totalBasicSalary += basicSalary;
      totalAllowances += allowances;
      totalDeductions += deductions;
      totalNetSalary += netSalary;

      return {
        empId: record.empId,
        name: record.employee?.name || 'Unknown',
        category: record.employee?.category || 'N/A',
        image: record.employee?.image,
        dailyRate: safeNumber(record.employee?.rate),
        totalHours: safeNumber(record.totalHours),
        presentDays: safeNumber(record.presentDays),
        completeDays: safeNumber(record.completeDays),
        basicSalary: basicSalary,
        allowances: record.allowances || {},
        deductions: record.deductions || {},
        totalAllowances: allowances,
        totalDeductions: deductions,
        grossSalary: grossSalary,
        netSalary: netSalary,
        status: record.status || 'draft',
        notes: record.notes || '',
        lastModified: record.updatedAt
      };
    });

    const report = {
      month: month,
      generatedAt: new Date().toISOString(),
      summary: {
        totalEmployees: totalEmployees,
        totalBasicSalary: parseFloat(totalBasicSalary.toFixed(2)),
        totalAllowances: parseFloat(totalAllowances.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        totalNetSalary: parseFloat(totalNetSalary.toFixed(2)),
        averageSalary: totalEmployees > 0 ? parseFloat((totalNetSalary / totalEmployees).toFixed(2)) : 0
      },
      employees: processedReports
    };

    console.log(`Successfully generated salary report for ${totalEmployees} employees`);
    res.json(report);

  } catch (error) {
    console.error('Error generating salary report:', error);
    res.status(500).json({ 
      message: 'Failed to generate salary report',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Approve salary for employee
export const approveSalary = async (req, res) => {
  try {
    const { employeeId, month, approvedBy = 'Admin' } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ 
        message: 'Employee ID and month are required' 
      });
    }

    console.log(`Approving salary for employee ${employeeId}, month ${month}`);

    const salaryRecord = await SalaryAdjustment.findOne({
      employee: employeeId,
      month: month
    });

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    // Update status to approved
    salaryRecord.status = 'approved';
    salaryRecord.approvedBy = approvedBy;
    salaryRecord.approvedAt = new Date();
    
    await salaryRecord.save();

    console.log(`Successfully approved salary for employee ${employeeId}`);

    res.json({
      message: 'Salary approved successfully',
      status: salaryRecord.status,
      approvedBy: salaryRecord.approvedBy,
      approvedAt: salaryRecord.approvedAt
    });

  } catch (error) {
    console.error('Error approving salary:', error);
    res.status(500).json({ 
      message: 'Failed to approve salary',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Mark salary as paid
export const markSalaryAsPaid = async (req, res) => {
  try {
    const { employeeId, month, paidBy = 'Admin' } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ 
        message: 'Employee ID and month are required' 
      });
    }

    console.log(`Marking salary as paid for employee ${employeeId}, month ${month}`);

    const salaryRecord = await SalaryAdjustment.findOne({
      employee: employeeId,
      month: month
    });

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    if (salaryRecord.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Salary must be approved before marking as paid' 
      });
    }

    // Update status to paid
    salaryRecord.status = 'paid';
    salaryRecord.paidBy = paidBy;
    salaryRecord.paidAt = new Date();
    
    await salaryRecord.save();

    console.log(`Successfully marked salary as paid for employee ${employeeId}`);

    res.json({
      message: 'Salary marked as paid successfully',
      status: salaryRecord.status,
      paidBy: salaryRecord.paidBy,
      paidAt: salaryRecord.paidAt
    });

  } catch (error) {
    console.error('Error marking salary as paid:', error);
    res.status(500).json({ 
      message: 'Failed to mark salary as paid',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};