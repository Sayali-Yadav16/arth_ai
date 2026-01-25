const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');

// Chatbot endpoint - requires authentication
router.post('/ask', authMiddleware, chatbotController.askQuestion);

module.exports = router;
