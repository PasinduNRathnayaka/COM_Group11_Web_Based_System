import Employee from '../../models/Seller/Employee.js';
import { generateQR } from '../../utils/generateQR.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Create Employee
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

// Login Employee (Updated with user type detection)
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find employee by email first, then by username
    let employee = await Employee.findOne({ email: email });
    
    // If not found by email, try username
    if (!employee) {
      employee = await Employee.findOne({ username: email }); // Using email input as username
    }
    
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: employee._id, type: 'employee' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return employee data with all necessary fields
    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email || employee.username, // Return email or username
      empId: employee.empId,
      category: employee.category, // This field will help determine user type
      role: employee.role, // Alternative field for user type
      contact: employee.contact,
      address: employee.address,
      image: employee.image,
      rate: employee.rate,
      about: employee.about,
      qrCode: employee.qrCode,
      token: token
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get All Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// Get Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching employee by ID' });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const fieldsToUpdate = ['name', 'about', 'category', 'contact', 'rate', 'address', 'username', 'email'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    if (req.file) {
      employee.image = `/uploads/employees/${req.file.filename}`;
    }

    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete employee', error: err.message });
  }
};