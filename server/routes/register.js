// routes/register.js
import express from 'express';
import bcrypt from 'bcryptjs';
import Seller from '../models/Seller.js';
import Employee from '../models/Employee.js';
import Customer from '../models/Customer.js';

const router = express.Router();

router.post('/register/:role', async (req, res) => {
  const { role } = req.params;
  const { username, password, ...extra } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  if (role === 'seller') user = new Seller({ username, password: hashedPassword, ...extra });
  else if (role === 'employee') user = new Employee({ username, password: hashedPassword, ...extra });
  else if (role === 'customer') user = new Customer({ username, password: hashedPassword, ...extra });
  else return res.status(400).json({ message: 'Invalid role' });

  await user.save();
  res.status(201).json({ message: `Registered as ${role}` });
});

export default router;
