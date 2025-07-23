// controllers/Seller/salaryController.js
import Attendance from '../../models/Seller/Attendance.js';
import Employee from '../../models/Seller/Employee.js';

// Helper function to calculate hours between check-in and check-out
const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  try {
    // Parse time strings in HH:MM:SS format
    const [inH, inM, inS = 0] = checkIn.split(':').map(Number);
    const [outH, outM, outS = 0] = checkOut.split(':').map(Number);

    // Convert to minutes for easier calculation
    const checkInMinutes = inH * 60 + inM + inS / 60;
    const checkOutMinutes = outH * 60 + outM + outS / 60;

    let durationMinutes = checkOutMinutes - checkInMinutes;

    // Handle overnight shifts (checkout next day)
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Add 24 hours in minutes
    }

    const hours = durationMinutes / 60;

    // Validate reasonable working hours (0-24 hours)
    if (isNaN(hours) || hours < 0 || hours > 24) {
      return 0;
    }

    return hours;
  } catch (error) {
    console.error('Error calculating working hours:', error);
    return 0;
  }
};

export const getMonthlySalary = async (req, res) => {
  try {
    const { month } = req.query; // Expected format: '2025-07'
    
    if (!month) {
      return res.status(400).json({ message: 'Month is required in YYYY-MM format' });
    }

    // Create date range for the month
    const startDate = `${month}-01`;
    const year = month.split('-')[0];
    const monthNum = month.split('-')[1];
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${daysInMonth.toString().padStart(2, '0')}`;

    // Fetch all employees
    const employees = await Employee.find().sort({ empId: 1 });

    const result = [];

    for (const employee of employees) {
      // Get all attendance records for this employee in the selected month
      const attendances = await Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      let totalHours = 0;
      let presentDays = 0;
      let completeDays = 0; // Days with both check-in and check-out

      // Calculate total working hours
      for (const attendance of attendances) {
        if (attendance.checkIn) {
          presentDays++;
          
          if (attendance.checkOut) {
            completeDays++;
            const hours = calculateWorkingHours(attendance.checkIn, attendance.checkOut);
            totalHours += hours;
          }
        }
      }

      // Calculate salary based on total hours worked
      const hourlyRate = employee.rate || 0;
      const totalSalary = totalHours * hourlyRate;

      result.push({
        empId: employee.empId,
        name: employee.name,
        category: employee.category,
        image: employee.image,
        hourlyRate: hourlyRate,
        totalHours: parseFloat(totalHours.toFixed(2)),
        presentDays: presentDays,
        completeDays: completeDays,
        salary: parseFloat(totalSalary.toFixed(2)),
        attendanceDetails: attendances.map(att => ({
          date: att.date,
          checkIn: att.checkIn,
          checkOut: att.checkOut,
          hours: att.checkIn && att.checkOut ? parseFloat(calculateWorkingHours(att.checkIn, att.checkOut).toFixed(2)) : 0
        }))
      });
    }

    // Sort by employee ID
    result.sort((a, b) => a.empId.localeCompare(b.empId));

    res.json(result);
  } catch (error) {
    console.error('Error calculating monthly salary:', error);
    res.status(500).json({ message: 'Failed to calculate monthly salary' });
  }
};

// Generate detailed salary report for PDF
export const getSalaryReport = async (req, res) => {
  try {
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ message: 'Month is required in YYYY-MM format' });
    }

    const startDate = `${month}-01`;
    const year = month.split('-')[0];
    const monthNum = month.split('-')[1];
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${daysInMonth.toString().padStart(2, '0')}`;

    const employees = await Employee.find().sort({ empId: 1 });
    const report = {
      month: month,
      generatedAt: new Date().toISOString(),
      employees: []
    };

    let totalCompanySalary = 0;

    for (const employee of employees) {
      const attendances = await Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      let totalHours = 0;
      let presentDays = 0;
      let completeDays = 0;

      const dailyRecords = [];

      for (const attendance of attendances) {
        let dayHours = 0;
        
        if (attendance.checkIn) {
          presentDays++;
          
          if (attendance.checkOut) {
            completeDays++;
            dayHours = calculateWorkingHours(attendance.checkIn, attendance.checkOut);
            totalHours += dayHours;
          }
        }

        dailyRecords.push({
          date: attendance.date,
          checkIn: attendance.checkIn || '--',
          checkOut: attendance.checkOut || '--',
          hours: dayHours > 0 ? parseFloat(dayHours.toFixed(2)) : 0,
          status: attendance.checkIn && attendance.checkOut ? 'Complete' : attendance.checkIn ? 'Incomplete' : 'Absent'
        });
      }

      const hourlyRate = employee.rate || 0;
      const totalSalary = totalHours * hourlyRate;
      totalCompanySalary += totalSalary;

      report.employees.push({
        empId: employee.empId,
        name: employee.name,
        category: employee.category,
        hourlyRate: hourlyRate,
        totalHours: parseFloat(totalHours.toFixed(2)),
        presentDays: presentDays,
        completeDays: completeDays,
        salary: parseFloat(totalSalary.toFixed(2)),
        dailyRecords: dailyRecords
      });
    }

    report.summary = {
      totalEmployees: employees.length,
      totalCompanySalary: parseFloat(totalCompanySalary.toFixed(2)),
      averageSalary: employees.length > 0 ? parseFloat((totalCompanySalary / employees.length).toFixed(2)) : 0
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating salary report:', error);
    res.status(500).json({ message: 'Failed to generate salary report' });
  }
};