import express from 'express';
import { googleAuth, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// Jab frontend "/api/auth/google" par POST request karega, toh googleAuth function chalega
router.post('/google', googleAuth);

// Jab frontend "/api/auth/logout" par GET request karega, toh logout function chalega
router.get('/logout', logout);

export default router;