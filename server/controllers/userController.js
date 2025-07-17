// User-specific actions
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, number } = req.body;

   // 1. Validate
  if (!name || !email || !password || !number) {
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
    password, // will be hashed by pre('save')
  });

   if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
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
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});