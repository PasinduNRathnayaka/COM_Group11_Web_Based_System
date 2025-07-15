// User-specific actions
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;


  });