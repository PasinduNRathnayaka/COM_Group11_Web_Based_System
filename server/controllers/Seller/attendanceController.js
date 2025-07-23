// controllers/Seller/attendanceController.js
import Attendance from '../../models/Seller/Attendance.js';
import Employee from '../../models/Seller/Employee.js';

const getToday = () => new Date().toISOString().split("T")[0];

// --- MARK ATTENDANCE ------------------------------------------
export const markAttendance = async (req, res) => {
  const { qrData, type } = req.body;

  try {
    const employee = await Employee.findOne({ empId: qrData });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const today = getToday();
    let attendance = await Attendance.findOne({ employee: employee._id, date: today });

    if (type === 'checkIn') {
      if (attendance && attendance.checkIn) return res.status(400).json({ message: 'Already checked in today' });
      if (!attendance) {
        attendance = new Attendance({ employee: employee._id, date: today });
      }
      const now = new Date();
      attendance.checkIn = now.toTimeString().split(' ')[0]; // HH:MM:SS (24hr)
    }

    if (type === 'checkOut') {
      if (!attendance) return res.status(400).json({ message: 'Check-in first before checking out' });
      if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out today' });
      const now = new Date();
      attendance.checkOut = now.toTimeString().split(' ')[0]; // HH:MM:SS (24hr)
    }

    await attendance.save();
    res.status(200).json({ message: `Successfully ${type}`, attendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
};

// --- GET ALL OR FILTERED BY DATE OR BY EMPLOYEE ID --------------
export const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;

    let filter = {};
    
    // If employeeId is provided, filter by employee
    if (employeeId) {
      filter.employee = employeeId;
    }
    
    // If date is provided, filter by date
    if (date) {
      filter.date = date;
    }

    const records = await Attendance.find(filter)
      .populate('employee')
      .sort({ date: -1, checkIn: 1 });

    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

// --- GET BY EMPLOYEE (Alternative endpoint) ------------------
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { empId } = req.params;

    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const records = await Attendance.find({ employee: employee._id })
      .populate('employee')
      .sort({ date: -1, checkIn: 1 });

    res.json(records);
  } catch (err) {
    console.error('Error fetching employee attendance:', err);
    res.status(500).json({ message: 'Error fetching employee attendance' });
  }
};

// --- 🆕 GET MONTHLY SALARY REPORT -----------------------------
export const getMonthlySalaryReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year are required' });

    const employees = await Employee.find();

    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, parseInt(month), 0).toISOString().split('T')[0];

    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('employee');

    const report = [];

    for (const emp of employees) {
      const empRecords = attendanceRecords.filter(r => r.employee._id.toString() === emp._id.toString());

      let totalHours = 0;

      empRecords.forEach(r => {
        if (r.checkIn && r.checkOut) {
          try {
            // Parse time strings (HH:MM:SS format)
            const [inH, inM, inS = 0] = r.checkIn.split(':').map(Number);
            const [outH, outM, outS = 0] = r.checkOut.split(':').map(Number);
            
            const checkInMinutes = inH * 60 + inM + inS / 60;
            const checkOutMinutes = outH * 60 + outM + outS / 60;
            
            let duration = checkOutMinutes - checkInMinutes;
            
            // Handle overnight shifts
            if (duration < 0) {
              duration += 24 * 60; // Add 24 hours in minutes
            }
            
            const hours = duration / 60;
            
            if (!isNaN(hours) && hours > 0 && hours <= 24) {
              totalHours += hours;
            }
          } catch (error) {
            console.error('Error calculating hours for record:', r, error);
          }
        }
      });

      const salary = Math.round(totalHours * (emp.rate || 0));

      report.push({
        empId: emp.empId,
        name: emp.name,
        category: emp.category,
        totalHours: totalHours.toFixed(2),
        hourlyRate: emp.rate || 0,
        image: emp.image,
        salary,
      });
    }

    res.json(report);
  } catch (err) {
    console.error('Error generating salary report:', err);
    res.status(500).json({ message: 'Failed to generate salary report' });
  }
};

// GET MONTHLY SUMMARY FOR ALL EMPLOYEES
export const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.query; // format: '2025-07'
    if (!month) return res.status(400).json({ message: 'Month is required in YYYY-MM format' });

    const start = `${month}-01`;
    const end = `${month}-31`; // crude end date for simplicity

    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
      checkIn: { $ne: null },
      checkOut: { $ne: null },
    }).populate('employee');

    const summary = {};

    for (let record of records) {
      const empId = record.employee._id.toString();
      
      try {
        // Parse time strings (HH:MM:SS format)
        const [inH, inM, inS = 0] = record.checkIn.split(':').map(Number);
        const [outH, outM, outS = 0] = record.checkOut.split(':').map(Number);
        
        const checkInMinutes = inH * 60 + inM + inS / 60;
        const checkOutMinutes = outH * 60 + outM + outS / 60;
        
        let duration = checkOutMinutes - checkInMinutes;
        
        // Handle overnight shifts
        if (duration < 0) {
          duration += 24 * 60; // Add 24 hours in minutes
        }
        
        const hours = duration / 60;

        if (!summary[empId]) {
          summary[empId] = {
            empId: record.employee.empId,
            name: record.employee.name,
            rate: record.employee.rate || 0,
            totalHours: 0,
          };
        }

        if (!isNaN(hours) && hours > 0 && hours <= 24) {
          summary[empId].totalHours += hours;
        }
      } catch (error) {
        console.error('Error calculating hours for record:', record, error);
      }
    }

    const result = Object.values(summary).map(emp => ({
      ...emp,
      totalHours: emp.totalHours.toFixed(2),
      salary: (emp.totalHours * emp.rate).toFixed(2),
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching monthly summary:', err);
    res.status(500).json({ message: 'Error fetching monthly summary' });
  }
};