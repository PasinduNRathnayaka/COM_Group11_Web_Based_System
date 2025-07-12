import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config.js';
import User from './models/user.model.js';
import Seller from './models/seller.model.js';
import Employee from './models/employee.model.js';
import OnlineEmployee from './models/onlineEmployee.model.js';
import connectDB from './configs/db.js';

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Seller.deleteMany(),
    Employee.deleteMany(),
    OnlineEmployee.deleteMany(),
  ]);

  // Hash password
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Insert demo users
  const users = [
    new User({
      name: 'John User',
      email: 'johnuser@gmail.com',
      password: hashedPassword,
    }),
    new Seller({
      name: 'Sam Seller',
      email: 'sellersam@gmail.com',
      password: hashedPassword,
    }),
    new Employee({
      name: 'Jane Employee',
      email: 'employeejane@gmail.com',
      password: hashedPassword,
    }),
    new OnlineEmployee({
      name: 'Online Support',
      email: 'supportonline@gmail.com',
      password: hashedPassword,
    }),
  ];

  for (const u of users) {
    await u.save();
  }

  console.log('✅ Seeded users for all categories.');
  process.exit();
};

seedData().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
