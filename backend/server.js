// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import workflowRoutes from './routes/workflows.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (optional)
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      console.warn('Continuing without MongoDB - workflow saving will be disabled');
    });
} else {
  console.warn('MONGODB_URI not set - workflow saving will be disabled');
}

// Routes
app.use('/api/workflows', workflowRoutes);

// Re-initialize Gemini after dotenv is loaded
import { initializeGemini } from './routes/workflows.js';
initializeGemini();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

