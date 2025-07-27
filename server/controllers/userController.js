// controllers/userController.js - Complete file with forgot password functionality
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  sendPasswordResetEmail, 
  sendPasswordResetSuccessEmail,
  generateResetCode, 
  generateResetToken 
} from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueName = `profile_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only image files'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, number, address } = req.body;

   // 1. Validate
  if (!name || !email || !password || !number || !address) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

   // 2. Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 3. Create user
  const user = await User.create({
    name,
    email,
    number,
    address,
    password, // will be hashed by pre('save')
  });

   if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      address: user.address,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      number: user.number,
      address: user.address,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// 🔑 NEW: Request password reset (send verification code)
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent.'
      });
    }

    // Check if user is currently locked out
    if (user.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((user.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      res.status(429);
      throw new Error(`Too many failed attempts. Please try again in ${lockTimeRemaining} minutes.`);
    }

    // Generate reset code and token
    const resetCode = generateResetCode();
    const resetToken = generateResetToken();
    
    // Set reset fields (expires in 15 minutes)
    user.resetPasswordCode = resetCode;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await user.save();

    // Send email with reset code
    await sendPasswordResetEmail(user.email, resetCode, user.name);

    res.json({
      success: true,
      message: 'Password reset code has been sent to your email.',
      // In development, you might want to return the code for testing
      // Remove this in production!
      ...(process.env.NODE_ENV === 'development' && { resetCode })
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    
    if (error.message.includes('Too many failed attempts')) {
      throw error;
    }
    
    res.status(500);
    throw new Error('Error sending password reset email. Please try again later.');
  }
});

// 🔑 NEW: Verify reset code and reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  // Validate input
  if (!email || !resetCode || !newPassword) {
    res.status(400);
    throw new Error('Email, reset code, and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  try {
    // Find user with valid reset code and not expired
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: resetCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      // Could be invalid code, expired code, or wrong email
      // Try to find user by email to increment attempts
      const userByEmail = await User.findOne({ email: email.toLowerCase().trim() });
      
      if (userByEmail) {
        await userByEmail.incrementResetAttempts();
        
        if (userByEmail.resetPasswordAttempts >= 4) { // Will be 5 after increment
          res.status(429);
          throw new Error('Too many failed attempts. Your account has been temporarily locked for 30 minutes.');
        }
      }
      
      res.status(400);
      throw new Error('Invalid or expired reset code');
    }

    // Check if user is locked out
    if (user.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((user.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      res.status(429);
      throw new Error(`Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`);
    }

    // Reset password
    user.password = newPassword; // Will be hashed by pre('save') middleware
    user.clearResetPasswordFields(); // Clear all reset-related fields
    
    await user.save();

    // Send success notification email (don't throw error if this fails)
    try {
      await sendPasswordResetSuccessEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send success email:', emailError);
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error.message.includes('Too many failed attempts') || 
        error.message.includes('temporarily locked') ||
        error.message.includes('Invalid or expired')) {
      throw error;
    }
    
    res.status(500);
    throw new Error('Error resetting password. Please try again later.');
  }
});

// 🔑 NEW: Verify reset code (without resetting password)
export const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, resetCode } = req.body;

  if (!email || !resetCode) {
    res.status(400);
    throw new Error('Email and reset code are required');
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: resetCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      // Try to find user by email to increment attempts
      const userByEmail = await User.findOne({ email: email.toLowerCase().trim() });
      
      if (userByEmail) {
        await userByEmail.incrementResetAttempts();
      }
      
      res.status(400);
      throw new Error('Invalid or expired reset code');
    }

    // Check if user is locked out
    if (user.isResetLocked()) {
      const lockTimeRemaining = Math.ceil((user.resetPasswordLockedUntil - Date.now()) / (1000 * 60));
      res.status(429);
      throw new Error(`Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`);
    }

    res.json({
      success: true,
      message: 'Reset code verified successfully. You can now set your new password.',
      token: user.resetPasswordToken // Can be used for additional security in next step
    });

  } catch (error) {
    console.error('Reset code verification error:', error);
    throw error;
  }
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, number, address } = req.body;
  const userId = req.user.id;

  try {
    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        res.status(400);
        throw new Error('Email already exists');
      }
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.number = number || user.number;
    user.address = address || user.address;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        number: updatedUser.number,
        address: updatedUser.address,
        profilePic: updatedUser.profilePic,
      }
    });

  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Profile update failed');
  }
});

// Update profile image
export const updateProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete old profile image if it exists and is not the default
    if (user.profilePic && !user.profilePic.includes('i.ibb.co')) {
      const oldImagePath = path.join(__dirname, '../uploads/profiles', path.basename(user.profilePic));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Set new profile picture path
    const profilePicUrl = `/uploads/profiles/${req.file.filename}`;
    user.profilePic = profilePicUrl;

    await user.save();

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      profilePic: profilePicUrl
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400);
    throw new Error(error.message || 'Profile image update failed');
  }
});

// Update user password
export const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    // Update password (will be hashed by pre('save') middleware)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Password update failed');
  }
});

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (user) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        address: user.address,
        profilePic: user.profilePic,
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      cart: user.cart || []
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Failed to get cart');
  }
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  try {
    const { productId, name, price, image, quantity = 1, description } = req.body;
    
    if (!productId || !name || !price) {
      res.status(400);
      throw new Error('Product ID, name, and price are required');
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({
        productId,
        name,
        price,
        image,
        quantity,
        description
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: user.cart
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Failed to add item to cart');
  }
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
      res.status(400);
      throw new Error('Valid product ID and quantity are required');
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const itemIndex = user.cart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      res.status(404);
      throw new Error('Item not found in cart');
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    res.json({
      success: true,
      message: 'Cart updated',
      cart: user.cart
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Failed to update cart');
  }
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = user.cart.filter(item => item.productId !== productId);
    await user.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: user.cart
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Failed to remove item from cart');
  }
});

// Clear entire cart
export const clearCart = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      cart: []
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Failed to clear cart');
  }
});