// server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './configs/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/Seller/product.routes.js';

// Setup __dirname manually (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allow specific frontend origin (CORS)
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

// Connect to MongoDB
await connectDB();

// ✅ Serve uploaded images from /uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Root Test Route
app.get('/', (req, res) => {
  res.send('✅ API is Working');
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
