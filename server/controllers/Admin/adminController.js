// controllers/Admin/adminController.js
import Admin from '../../models/Admin/Admin.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { 
  sendPasswordResetEmail, 
  sendPasswordResetSuccessEmail,
  generateResetCode, 
  generateResetToken 
} from '../../utils/emailService.js';

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

// @desc    Request Password Reset for Admin
// @route   POST /api/admin/forgot-password
// @access  Public
export const requestAdminPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log(`🔍 Looking for admin with email: ${email}`);

    // Find admin by email
    const searchValue = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: searchValue });
    
    if (!admin) {
      console.log('❌ Admin not found');
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent.'
      });
    }

    console.log('✅ Admin found:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive
    });

    // Check if admin account is active
    if (!admin.isActive) {
      console.log('❌ Admin account is deactivated');
      return res.status(400).json({ 
        message: 'Admin account is deactivated. Please contact super administrator.' 
      });
    }

    // Check if admin is currently locked out
    if (admin.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((admin.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      console.log(`⏰ Admin is locked for ${lockTimeRemaining} minutes`);
      return res.status(429).json({ 
        message: `Too many failed attempts. Please try again in ${lockTimeRemaining} minutes.` 
      });
    }

    // Generate reset code and token
    const resetCode = generateResetCode();
    const resetToken = generateResetToken();
    
    // Set reset fields (expires in 15 minutes)
    admin.resetPasswordCode = resetCode;
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    
    await admin.save();
    console.log('💾 Reset fields saved to admin');

    // Get user type for email template
    const userType = admin.getUserType();

    console.log(`📧 Sending email to ${admin.email} as ${userType}`);

    // Send email with reset code
    const emailResult = await sendPasswordResetEmail(
      admin.email, 
      resetCode, 
      admin.name, 
      userType
    );

    console.log('✅ Email sent successfully:', emailResult);

    res.json({
      success: true,
      message: 'Password reset code has been sent to your email.',
      userType: userType,
      // Development info (remove in production)
      ...(process.env.NODE_ENV === 'development' && { 
        resetCode,
        adminInfo: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
          userType: userType
        }
      })
    });

  } catch (error) {
    console.error('❌ Admin password reset request error:', error);
    
    if (error.message.includes('Too many failed attempts')) {
      return res.status(429).json({ message: error.message });
    }
    
    // Provide more specific error messages
    let errorMessage = 'Error sending password reset email. Please try again later.';
    
    if (error.message.includes('authentication failed') || error.code === 'EAUTH') {
      errorMessage = 'Email service authentication failed. Please contact system administrator.';
    } else if (error.message.includes('Invalid email') || error.code === 'ENOTFOUND') {
      errorMessage = 'Email service configuration error. Please contact system administrator.';
    } else if (error.message.includes('Invalid login')) {
      errorMessage = 'Invalid email credentials. Please verify EMAIL_USER and EMAIL_PASS';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      category: 'EMAIL_SERVICE_ERROR',
      debug: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        code: error.code,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Verify Admin Reset Code
// @route   POST /api/admin/verify-reset-code
// @access  Public
export const verifyAdminResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({ message: 'Email and reset code are required' });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: resetCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      const adminByEmail = await Admin.findOne({ 
        email: email.toLowerCase().trim()
      });
      
      if (adminByEmail) {
        await adminByEmail.incrementResetAttempts();
      }
      
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Check if admin is locked out
    if (admin.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((admin.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({ 
        message: `Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.` 
      });
    }

    res.json({
      success: true,
      message: 'Reset code verified successfully. You can now set your new password.',
      token: admin.resetPasswordToken
    });

  } catch (error) {
    console.error('Admin reset code verification error:', error);
    res.status(500).json({ message: 'Error verifying reset code. Please try again later.' });
  }
};

// @desc    Reset Admin Password
// @route   POST /api/admin/reset-password
// @access  Public
export const resetAdminPassword = async (req, res) => {
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

    // Find admin with valid reset code and not expired
    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: resetCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      // Try to find admin by email to increment attempts
      const adminByEmail = await Admin.findOne({ 
        email: email.toLowerCase().trim()
      });
      
      if (adminByEmail) {
        await adminByEmail.incrementResetAttempts();
        
        if (adminByEmail.resetPasswordAttempts >= 4) {
          return res.status(429).json({ 
            message: 'Too many failed attempts. Your account has been temporarily locked for 30 minutes.' 
          });
        }
      }
      
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Check if admin is locked out
    if (admin.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((admin.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({ 
        message: `Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.` 
      });
    }

    // Reset password
    admin.password = newPassword;
    admin.clearResetPasswordFields();
    
    await admin.save();

    // Send success notification email
    try {
      await sendPasswordResetSuccessEmail(admin.email, admin.name);
    } catch (emailError) {
      console.error('Failed to send success email:', emailError);
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Admin password reset error:', error);
    
    if (error.message.includes('Too many failed attempts') || 
        error.message.includes('temporarily locked') ||
        error.message.includes('Invalid or expired')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error resetting password. Please try again later.' });
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