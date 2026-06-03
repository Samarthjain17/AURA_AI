import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/connectDB.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';

dotenv.config();
const app = express();

// --- MIDDLEWARES ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}));

// --- ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Hello from Your Unique AI Assistant Backend! 🔥" });
});

// --- SERVER START ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
    connectDB();
});