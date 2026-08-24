require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import SSE Manager & Worker so they boot up and register listeners
const sseManager = require('./services/streaming/sseManager');
require('./workers/reviewWorker');

// Initialize database connection
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Real-time progress SSE stream endpoint
app.get('/api/stream/:jobId', (req, res) => {
  const { jobId } = req.params;
  if (!jobId) {
    return res.status(400).json({ success: false, message: 'Missing jobId parameter' });
  }
  sseManager.register(jobId, res);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/repos', require('./routes/repos'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/github', require('./routes/github'));

// Basic Health Check Route
app.get('/', (req, res) => {
  res.status(200).send('AI Code Review Agent API is running.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Uncaught Exception:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server executing in production mode on port ${PORT}`);
});
