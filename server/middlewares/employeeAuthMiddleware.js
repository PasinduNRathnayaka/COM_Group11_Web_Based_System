import jwt from 'jsonwebtoken';
import Employee from '../models/Seller/Employee.js';

// Employee token verification middleware
export const protectEmployee = async (req, res, next) => {
  let token;

  try {
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies as fallback
    else if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find employee by empid from token
    const employee = await Employee.findOne({ empId: decoded.empid || decoded.empId || decoded.id })
      .select('-password'); // Exclude password from response

    if (!employee) {
      return res.status(401).json({ 
        success: false,
        message: 'Employee not found, token invalid' 
      });
    }

    // Add employee data to request object
    req.employee = employee;
    req.empId = employee.empId;
    
    next();
  } catch (error) {
    console.error('Employee token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token verification failed' 
    });
  }
};

// Optional: Role-based access control for employees
export const authorizeEmployeeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied, no employee data' 
      });
    }

    if (!roles.includes(req.employee.role || req.employee.category)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};