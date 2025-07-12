// controllers/auth.controller.js
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Employee from '../models/Employee.js';
import OnlineEmployee from '../models/OnlineEmployee.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let role = null;
    let user = null;

    // Try finding in all roles
    user = await Seller.findOne({ email });
    if (user) role = "seller";

    if (!user) {
      user = await Employee.findOne({ email });
      if (user) role = "employee";
    }

    if (!user) {
      user = await OnlineEmployee.findOne({ email });
      if (user) role = "online-employee";
    }

    if (!user) {
      user = await User.findOne({ email });
      if (user) role = "user";
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      role,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
