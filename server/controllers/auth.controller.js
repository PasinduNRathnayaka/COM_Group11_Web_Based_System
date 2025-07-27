// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import Employee from '../models/Seller/Employee.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get employee from token
    const employee = await Employee.findById(decoded.id).select('-password');
    
    if (!employee) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid.' 
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid.' 
    });
  }
};

// Middleware to check if user is employee
export const isEmployee = (req, res, next) => {
  if (req.employee && req.employee.category) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Employee role required.' 
    });
  }
};