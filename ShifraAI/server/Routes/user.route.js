import express from 'express';
import { getCurrentUser, logoutUser, saveAssistantSettings, getUserSettings } from '../controllers/user.controller.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

// 👤 Auth endpoints
router.get('/current-user', isAuth, getCurrentUser);
router.post('/logout', logoutUser);

// 🚀 SaaS Builder endpoints
router.post('/save-assistant', isAuth, saveAssistantSettings);
router.get('/get-settings/:email', isAuth, getUserSettings);

export default router;