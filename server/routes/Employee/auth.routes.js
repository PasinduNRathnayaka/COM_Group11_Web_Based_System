import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import Employee from '../../models/Employee/Employee.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (empId) => {
  return jwt.sign({ empid: empId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Employee login
// @route   POST /api/employee-auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { empId, password, email } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (!empId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID or email is required'
      });
    }

    // Find employee by empId or email
    let employee;
    if (empId) {
      employee = await Employee.findOne({ empId });
    } else {
      employee = await Employee.findOne({ email: email.toLowerCase() });
    }

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(employee.empId);

    // Set cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        category: employee.category,
        token
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Employee logout
// @route   POST /api/employee-auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.cookie('authToken', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;