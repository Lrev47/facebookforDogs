// src/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Middlewares
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware (catch all)
app.use(errorHandler);

module.exports = app;
