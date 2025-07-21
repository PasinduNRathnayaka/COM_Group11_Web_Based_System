import Attendance from '../../models/Seller/Attendance.js';
import Employee from '../../models/Seller/Employee.js';

const getToday = () => new Date().toISOString().split("T")[0];

// MARK ATTENDANCE ------------------------------------------
export const markAttendance = async (req, res) => {
  const { qrData, type } = req.body;

  try {
    const employee = await Employee.findOne({ empId: qrData });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = getToday();
    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    if (type === 'checkIn') {
      if (attendance) {
        if (attendance.checkIn) {
          return res.status(400).json({ message: 'Already checked in today' });
        } else {
          attendance.checkIn = new Date().toLocaleTimeString();
        }
      } else {
        attendance = new Attendance({
          employee: employee._id,
          date: today,
          checkIn: new Date().toLocaleTimeString(),
        });
      }
    }

    if (type === 'checkOut') {
      if (!attendance) {
        return res.status(400).json({ message: 'Check-in first before checking out' });
      }
      if (attendance.checkOut) {
        return res.status(400).json({ message: 'Already checked out today' });
      }
      attendance.checkOut = new Date().toLocaleTimeString();
    }

    await attendance.save();

    res.status(200).json({
      message: `Successfully ${type === 'checkIn' ? 'checked in' : 'checked out'}`,
      attendance,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
};

// GET ALL OR FILTERED BY DATE ------------------------------------------
export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    let filter = {};
    if (date) {
      filter.date = date;
    }

    const records = await Attendance.find(filter)
      .populate('employee')
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

// In attendanceController.js
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { empId } = req.params;

    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const records = await Attendance.find({ employee: employee._id })
      .populate('employee')
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error fetching employee attendance' });
  }
};

