import express from 'express';
import { askWidget } from '../controllers/widget.controller.js';

const router = express.Router();

// Route: http://localhost:8000/api/widget/ask
router.post('/ask', askWidget);

export default router;