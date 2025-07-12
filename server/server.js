// server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
await connectDB();

// Allow multiple origins (CORS)
const allowedOrigins = ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true  // ✅ Note the correct spelling is `credentials`, not `Credential`
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send("API is Working ✅");
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
