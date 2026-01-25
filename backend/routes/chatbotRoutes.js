import express from 'express';
import { askQuestion } from '../controllers/chatbotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Chatbot endpoint - requires authentication
router.post('/ask', authMiddleware, askQuestion);

export default router;
