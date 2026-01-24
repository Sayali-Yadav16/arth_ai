const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taxRoutes = require('./routes/taxRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'TaxBuddy backend is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini API configured: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-pro'}`);
});