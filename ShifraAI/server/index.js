import express from "express"

import dotenv from "dotenv"
import connectDB from "./Configs/ConnextDB.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT

app.get("/" , (req,res)=>{
    res.json("Hello from Server")
})

app.listen(PORT , ()=>{
    console.log(`Server Started on Port ${PORT}`)
    connectDB()
})

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/connectDB.js';
import authRoutes from './routes/auth.route.js'; // 👈 Ye line add karo

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}));

// --- ROUTES ---
// 👈 Ye line add karo. Isse saare auth routes "/api/auth" se shuru honge
app.use('/api/auth', authRoutes); 

app.get('/', (req, res) => {
    res.json({ message: "Hello from Your Unique AI Assistant Backend! 🔥" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
    connectDB();
});