const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

// Test Gemini API endpoint
router.get('/test-gemini', (req, res) => {
  const gemini = require('../utils/gemini');
  res.json({ 
    configured: !!process.env.GEMINI_API_KEY,
    message: process.env.GEMINI_API_KEY ? 'Gemini API is configured' : 'Gemini API key not found'
  });
});

// Analyze documents with Gemini AI
router.post('/analyze-documents', authMiddleware, analysisController.analyzeDocuments);

module.exports = router;