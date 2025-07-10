// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // Send role-specific info
    res.json({
      username: user.username,
      role: user.role,
      message: `Logged in as ${user.role}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
