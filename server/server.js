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
import employeeRoutes from './routes/Seller/employee.routes.js';
import userRoutes from './routes/userRoutes.js';

// Setup __dirname (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB().then(() => {
  console.log("✅ Connected to MongoDB");
}).catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1); // Exit if DB connection fails
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/user', userRoutes);

app.use('/api/employees', employeeRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Default route
app.get('/', (req, res) => {
  res.send('✅ API is Working');
});
app.listen(4000, () => console.log("Server running at http://localhost:4000"));
// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});