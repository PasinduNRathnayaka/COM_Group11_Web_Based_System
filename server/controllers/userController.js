// User-specific actions
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

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

  /*  Login controller placeholder */
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