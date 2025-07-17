import Employee from '../../models/Seller/Employee.js';
import { generateQR } from '../../utils/generateQR.js';
import bcrypt from 'bcryptjs';

export const createEmployee = async (req, res) => {
  try {
    const { empId, name, about, category, contact, rate, address, username, password, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const qrFilename = `${empId}_qr.png`;
    const qrCodePath = await generateQR(empId, qrFilename);

    const employee = new Employee({
      empId,
      name,
      about,
      category,
      contact,
      rate,
      address,
      username,
      password: hashedPassword,
      email: email || null, // ✅ safely set null if empty
      image: req.file ? `/uploads/employees/${req.file.filename}` : '',
      qrCode: qrCodePath,
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    console.error("❌ Failed to create employee:", err.message);
    res.status(500).json({ message: "Failed to create employee", error: err.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};
