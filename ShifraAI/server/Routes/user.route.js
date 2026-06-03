import express from 'express';
import { getCurrentUser } from '../controllers/user.controller.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

// Jab koi "/current-user" pe GET request karega, toh pehle isAuth check karega, fir getCurrentUser chalega
router.get('/current-user', isAuth, getCurrentUser);

export default router;