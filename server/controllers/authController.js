// controllers/auth.controller.js
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Employee from '../models/Employee.js';
import OnlineEmployee from '../models/OnlineEmployee.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check all user types
    const seller = await Seller.findOne({ email });
    const employee = await Employee.findOne({ email });
    const onlineEmployee = await OnlineEmployee.findOne({ email });
    const user = await User.findOne({ email });

    const account = seller || employee || onlineEmployee || user;

    if (!account) return res.status(404).json({ message: 'User not found' });
    if (account.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

    let role = '';
    if (seller) role = 'seller';
    else if (employee) role = 'employee';
    else if (onlineEmployee) role = 'online-employee';
    else role = 'user';

    res.status(200).json({
      message: 'Login successful',
      role,
      user: {
        name: account.name,
        email: account.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
