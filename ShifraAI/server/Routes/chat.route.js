import express from 'express';
import { generateResponse } from '../controllers/chat.controller.js';

const router = express.Router();

// Jab bhi koi /api/chat/generate par POST request karega, AI answer dega
router.post('/generate', generateResponse);

export default router;