// controllers/Seller/employeeController.js - Complete with forgot password
import Employee from '../../models/Seller/Employee.js';
import { generateQR } from '../../utils/generateQR.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { 
  sendPasswordResetEmail, 
  sendPasswordResetSuccessEmail,
  generateResetCode, 
  generateResetToken 
} from '../../utils/emailService.js';

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

// Login Employee
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
      email: employee.email || employee.username,
      empId: employee.empId,
      category: employee.category,
      role: employee.role,
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

// 🔑 NEW: Request password reset for employee
export const requestEmployeePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find employee by email or username
    let employee = await Employee.findOne({ 
      $or: [
        { email: email.toLowerCase().trim() },
        { username: email.toLowerCase().trim() }
      ]
    });
    
    if (!employee) {
      // Don't reveal if email/username exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent.'
      });
    }

    // Check if employee doesn't have email
    if (!employee.email) {
      return res.status(400).json({ 
        message: 'This account does not have an email address associated. Please contact your administrator.' 
      });
    }

    // Check if employee is currently locked out
    if (employee.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((employee.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({ 
        message: `Too many failed attempts. Please try again in ${lockTimeRemaining} minutes.` 
      });
    }

    // Generate reset code and token
    const resetCode = generateResetCode();
    const resetToken = generateResetToken();
    
    // Set reset fields (expires in 15 minutes)
    employee.resetPasswordCode = resetCode;
    employee.resetPasswordToken = resetToken;
    employee.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    
    await employee.save();

    // Send email with reset code
    await sendPasswordResetEmail(employee.email, resetCode, employee.name);

    res.json({
      success: true,
      message: 'Password reset code has been sent to your email.',
      ...(process.env.NODE_ENV === 'development' && { resetCode })
    });

  } catch (error) {
    console.error('Employee password reset request error:', error);
    
    if (error.message.includes('Too many failed attempts')) {
      return res.status(429).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error sending password reset email. Please try again later.' });
  }
};

// 🔑 NEW: Reset employee password
export const resetEmployeePassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    // Validate input
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ 
        message: 'Email, reset code, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Find employee with valid reset code and not expired
    const employee = await Employee.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: email.toLowerCase().trim() }
      ],
      resetPasswordCode: resetCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!employee) {
      // Try to find employee by email to increment attempts
      const employeeByEmail = await Employee.findOne({ 
        $or: [
          { email: email.toLowerCase().trim() },
          { username: email.toLowerCase().trim() }
        ]
      });
      
      if (employeeByEmail) {
        await employeeByEmail.incrementResetAttempts();
        
        if (employeeByEmail.resetPasswordAttempts >= 4) {
          return res.status(429).json({ 
            message: 'Too many failed attempts. Your account has been temporarily locked for 30 minutes.' 
          });
        }
      }
      
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Check if employee is locked out
    if (employee.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((employee.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({ 
        message: `Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.` 
      });
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    employee.clearResetPasswordFields();
    
    await employee.save();

    // Send success notification email
    if (employee.email) {
      try {
        await sendPasswordResetSuccessEmail(employee.email, employee.name);
      } catch (emailError) {
        console.error('Failed to send success email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Employee password reset error:', error);
    
    if (error.message.includes('Too many failed attempts') || 
        error.message.includes('temporarily locked') ||
        error.message.includes('Invalid or expired')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error resetting password. Please try again later.' });
  }
};

// 🔑 NEW: Verify employee reset code
export const verifyEmployeeResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({ message: 'Email and reset code are required' });
    }

    const employee = await Employee.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: email.toLowerCase().trim() }
      ],
      resetPasswordCode: resetCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!employee) {
      const employeeByEmail = await Employee.findOne({ 
        $or: [
          { email: email.toLowerCase().trim() },
          { username: email.toLowerCase().trim() }
        ]
      });
      
      if (employeeByEmail) {
        await employeeByEmail.incrementResetAttempts();
      }
      
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Check if employee is locked out
    if (employee.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((employee.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({ 
        message: `Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.` 
      });
    }

    res.json({
      success: true,
      message: 'Reset code verified successfully. You can now set your new password.',
      token: employee.resetPasswordToken
    });

  } catch (error) {
    console.error('Employee reset code verification error:', error);
    res.status(500).json({ message: 'Error verifying reset code. Please try again later.' });
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