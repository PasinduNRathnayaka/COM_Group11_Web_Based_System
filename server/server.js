import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import connectDB from './configs/db.js';
import productRoutes from './routes/Seller/product.routes.js';
import categoryRoutes from './routes/Seller/category.routes.js';
import employeeRoutes from './routes/Seller/employee.routes.js';
import sellerOrderRoutes from './routes/Seller/order.routes.js';
import billRoutes from './routes/Seller/bill.routes.js';

import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import productReviewRoutes from './routes/productReviewRoutes.js';
import contactRoutes from './routes/contact.js';
import userOrderRoutes from './routes/userOrder.routes.js';

import attendanceRoutes from './routes/Seller/attendance.routes.js';
import salaryRoutes from './routes/Seller/salary.routes.js';

import orderRoutes from './routes/OnlineEmployee/order.routes.js';
import messageRoutes from './routes/OnlineEmployee/message.routes.js';

import viewAttendanceRoutes from './routes/Employee/viewattendance.routes.js';

const app = express();
dotenv.config();

// Setup __dirname (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ✅ Serve static images
app.use(
  '/uploads',
  express.static('uploads', {
    setHeaders: (res, path, stat) => {
      res.set('Access-Control-Allow-Origin', '*');
    },
  })
);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/seller/orders', sellerOrderRoutes); 

app.use('/api/user', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/product-reviews', productReviewRoutes);
app.use('/api/user-orders', userOrderRoutes);
app.use('/api/attendance', viewAttendanceRoutes);
app.use('/api/bills', billRoutes);

app.use('/api/contact', contactRoutes);
app.use('/api/message', messageRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('✅ API is Working');
});

// Start Server
connectDB();

app.listen(process.env.PORT || 4000, () => {
  console.log('Server started on port 4000');
});