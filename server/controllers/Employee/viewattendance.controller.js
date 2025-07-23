import ViewAttendance from '../../models/Employee/viewattendance.model.js';




export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    const regexDate = new RegExp(`^${year}-${month.padStart(2, "0")}`);

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $regex: regexDate },
    });

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance", error: err });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const newRecord = new Attendance(req.body);
    const saved = await newRecord.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error saving attendance", error: err });
  }
};
