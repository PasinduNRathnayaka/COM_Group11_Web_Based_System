import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './configs/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/Seller/product.routes.js';
import categoryRoutes from './routes/Seller/category.routes.js';
import employeeRoutes from './routes/Seller/employee.routes.js'; // ✅ NEW
import userRoutes from './routes/userRoutes.js';

// Setup __dirname (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

// ✅ Connect to MongoDB before starting server
await connectDB();

// ✅ Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes); // ✅ NEW employee route
app.use('/api/user', userRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('✅ API is Working');
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
