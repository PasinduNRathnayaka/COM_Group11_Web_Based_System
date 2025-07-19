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
      email: email || null,
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

// ✅ GET employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching employee by ID' });
  }
};

// ✅ PUT (update employee)
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Update fields
    const fieldsToUpdate = ['name', 'about', 'category', 'contact', 'rate', 'address', 'username', 'email'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    // Handle image update
    if (req.file) {
      employee.image = `/uploads/employees/${req.file.filename}`;
    }

    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
};
