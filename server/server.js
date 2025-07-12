// server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/Seller/product.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect to MongoDB
await connectDB();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS configuration
const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send("API is Working ✅");
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
