// backend/app.js
const express = require('express');
const tasksRouter = require('./routes/tasks'); // Adjust path if needed

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use the tasks router for /api/tasks endpoint
app.use('/api/tasks', tasksRouter);

module.exports = app; // Export the app for testing
