// controllers/Seller/salaryController.js

import Attendance from '../../models/Seller/Attendance.js';
import Employee from '../../models/Seller/Employee.js';

export const getMonthlySalary = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required' });
  }

  try {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Fetch all employees
    const employees = await Employee.find();

    const result = [];

    for (const emp of employees) {
      const attendances = await Attendance.find({
        employee: emp._id,
        date: { $gte: startDate.toISOString().split("T")[0], $lt: endDate.toISOString().split("T")[0] },
        checkIn: { $ne: null }
      });

      const presentDays = attendances.length;
      const salary = emp.rate * presentDays;

      result.push({
        employee: {
          name: emp.name,
          empId: emp.empId,
        },
        presentDays,
        salary,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to calculate salary' });
  }
};
