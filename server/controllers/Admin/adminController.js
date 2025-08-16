// controllers/Admin/adminController.js
import Admin from '../../models/Admin/Admin.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '30d'
  });
};

// @desc    Register Admin (Initial setup only)
// @route   POST /api/admin/register
// @access  Public (but should be protected in production)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin with this email already exists' 
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      mobile: mobile || null
    });

    if (admin) {
      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        admin: admin.getPublicProfile(),
        token: generateToken(admin._id)
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid admin data' 
      });
    }
  } catch (error) {
    console.error('❌ Admin registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login Admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find admin and include password field
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin account is deactivated' 
      });
    }

    // Update last login
    await admin.updateLastLogin();

    res.json({
      success: true,
      message: 'Login successful',
      admin: admin.getPublicProfile(),
      token: generateToken(admin._id)
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      admin: admin.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Get admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
// @access  Private
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    const { name, email, mobile } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      admin.email = email;
    }

    // Update other fields
    if (name) admin.name = name;
    if (mobile !== undefined) admin.mobile = mobile || null;

    // Handle avatar upload if provided
    if (req.file) {
      // Delete old avatar if exists
      if (admin.avatar) {
        const oldAvatarPath = path.join(process.cwd(), admin.avatar.replace('/uploads/', 'uploads/'));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      admin.avatar = `/uploads/admin/${req.file.filename}`;
    }

    const updatedAdmin = await admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: updatedAdmin.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Update admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Change Admin Password
// @route   PUT /api/admin/change-password
// @access  Private
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide current and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Check current password
    const isCurrentPasswordValid = await admin.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change admin password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get Admin Dashboard Stats (Optional)
// @route   GET /api/admin/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // You can add dashboard statistics here
    // For now, just return admin info and basic stats
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // You can add more stats here like total employees, products, etc.
    const stats = {
      admin: admin.getPublicProfile(),
      loginTime: new Date(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};