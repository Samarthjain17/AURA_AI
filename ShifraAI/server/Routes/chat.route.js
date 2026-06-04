import express from 'express';
import { generateResponse, getChatHistory } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/generate', generateResponse);
router.post('/history', getChatHistory); // 👈 Ye naya history wala route hai

export default router;