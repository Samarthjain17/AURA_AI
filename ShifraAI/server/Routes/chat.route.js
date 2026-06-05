import express from 'express';
import { generateResponse, getChatHistory, clearChat, getUserChats } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/generate', generateResponse);
router.post('/history', getChatHistory);
router.post('/clear', clearChat);
router.post('/all', getUserChats); // 👈 Naya rasta Sidebar ke liye

export default router;
