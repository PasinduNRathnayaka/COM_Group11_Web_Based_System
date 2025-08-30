// middlewares/employeeAuth.js
import jwt from 'jsonwebtoken';
import Employee from '../models/Seller/Employee.js';

export const authenticateEmployee = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Find employee and exclude sensitive fields
      const employee = await Employee.findById(decoded.id).select('-password -resetPasswordCode -resetPasswordToken');
      
      if (!employee) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. Employee not found.'
        });
      }

      // Check if employee is soft deleted
      if (employee.isDeleted) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Please contact administrator.'
        });
      }

      // Add employee info to request
      req.user = {
        id: employee._id,
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        category: employee.category,
        role: employee.role
      };

      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }

  } catch (error) {
    console.error('Employee authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware to check if user is a regular employee (not admin/seller)
export const requireEmployeeRole = (req, res, next) => {
  try {
    const { category, role } = req.user;
    
    // Allow regular employees and e-commerce employees
    const allowedCategories = ['Employee', 'Employee for E-com', 'employee', 'online_employee'];
    
    if (!allowedCategories.includes(category) && role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for employees only.'
      });
    }

    next();
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during role verification.'
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalEmployeeAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next(); // Continue without authentication
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const employee = await Employee.findById(decoded.id).select('-password -resetPasswordCode -resetPasswordToken');
      
      if (employee && !employee.isDeleted) {
        req.user = {
          id: employee._id,
          empId: employee.empId,
          name: employee.name,
          email: employee.email,
          category: employee.category,
          role: employee.role
        };
      }
    } catch (tokenError) {
      // Token invalid, continue without authentication
      console.log('Optional auth - invalid token, continuing...');
    }

    next();
  } catch (error) {
    console.error('Optional employee authentication error:', error);
    next(); // Continue even if error
  }
};