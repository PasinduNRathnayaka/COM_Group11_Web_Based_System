// middlewares/adminAuth.js
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin/Admin.js';

export const adminAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');

        // Get admin from token (excluding password)
        req.admin = await Admin.findById(decoded.id);

        if (!req.admin) {
          return res.status(401).json({ 
            success: false, 
            message: 'Admin not found' 
          });
        }

        if (!req.admin.isActive) {
          return res.status(401).json({ 
            success: false, 
            message: 'Admin account is deactivated' 
          });
        }

        next();
      } catch (error) {
        console.error('❌ Token verification error:', error);
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized, token failed' 
        });
      }
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }
  } catch (error) {
    console.error('❌ Admin auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in authentication' 
    });
  }
};