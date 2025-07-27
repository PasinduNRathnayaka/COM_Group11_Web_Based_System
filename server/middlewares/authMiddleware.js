import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import multer from 'multer';

// ✅ Token verification middleware
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = { id: decoded.id }; // Attach user id to request
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ✅ Role-based middleware to allow only employees
export const isEmployee = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied: employee only' });
    }

    next();
  } catch (error) {
    console.error('isEmployee check failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Multer error handling
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
  }

  if (error.message === 'Please upload only image files') {
    return res.status(400).json({
      success: false,
      message: 'Please upload only image files (JPG, PNG, GIF, etc.)',
    });
  }

  next(error);
};
