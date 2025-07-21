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
      attendance.checkIn = new Date().toLocaleTimeString();
    }

    if (type === 'checkOut') {
      if (!attendance) return res.status(400).json({ message: 'Check-in first before checking out' });
      if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out today' });
      attendance.checkOut = new Date().toLocaleTimeString();
    }

    await attendance.save();
    res.status(200).json({ message: `Successfully ${type}`, attendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
};

// --- GET ALL OR FILTERED BY DATE ------------------------------
export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    let filter = {};
    if (date) filter.date = date;

    const records = await Attendance.find(filter)
      .populate('employee')
      .sort({ date: -1, checkIn: 1 });

    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

// --- GET BY EMPLOYEE ------------------------------------------
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

    employees.forEach(emp => {
      const empRecords = attendanceRecords.filter(r => r.employee._id.toString() === emp._id.toString());

      let totalHours = 0;
      empRecords.forEach(r => {
        if (r.checkIn && r.checkOut) {
          const [inH, inM, inS] = r.checkIn.split(':').map(Number);
          const [outH, outM, outS] = r.checkOut.split(':').map(Number);
          const checkInDate = new Date(2000, 0, 1, inH, inM, inS);
          const checkOutDate = new Date(2000, 0, 1, outH, outM, outS);

          const durationMs = checkOutDate - checkInDate;
          const hours = durationMs / (1000 * 60 * 60); // ms to hours
          if (hours > 0) totalHours += hours;
        }
      });

      const salary = Math.round(totalHours * emp.rate);
      report.push({
        empId: emp.empId,
        name: emp.name,
        category: emp.category,
        totalHours: totalHours.toFixed(2),
        hourlyRate: emp.rate,
         image: employee.image,
        salary,
      });
    });

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
      const checkIn = new Date(`${record.date}T${record.checkIn}`);
      const checkOut = new Date(`${record.date}T${record.checkOut}`);
      const hours = (checkOut - checkIn) / (1000 * 60 * 60); // convert ms to hours

      if (!summary[empId]) {
        summary[empId] = {
          empId: record.employee.empId,
          name: record.employee.name,
          rate: record.employee.rate || 0,
          totalHours: 0,
        };
      }

      summary[empId].totalHours += hours;
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
