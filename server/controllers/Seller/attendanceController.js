import Attendance from '../../models/Seller/Attendance.js';
import Employee from '../../models/Seller/Employee.js';

const getToday = () => new Date().toISOString().split("T")[0];

export const markAttendance = async (req, res) => {
  const { qrData, type } = req.body;

  try {
    const employee = await Employee.findOne({ empId: qrData });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const today = getToday();
    let attendance = await Attendance.findOne({ employee: employee._id, date: today });

    if (!attendance) {
      if (type === 'checkIn') {
        attendance = new Attendance({
          employee: employee._id,
          date: today,
          checkIn: new Date().toLocaleTimeString(),
        });
      } else {
        return res.status(400).json({ message: 'Check-in first' });
      }
    } else {
      if (type === 'checkOut') {
        if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out' });
        attendance.checkOut = new Date().toLocaleTimeString();
      } else {
        return res.status(400).json({ message: 'Already checked in' });
      }
    }

    await attendance.save();
    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('employee')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};
