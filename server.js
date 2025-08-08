const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

// Import Passport configurations
require('./config/passport');
require('./config/outlook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'TimeHaven backend is running!' });
});

// Import database functions
const { createUser, getUser } = require('./utils/database');

// Test user creation endpoint
app.post('/test-user', async (req, res) => {
  try {
    const userData = {
      id: Date.now().toString(), // Simple ID generation
      name: req.body.name,
      email: req.body.email,
      timezone: 'America/New_York'
    };
    
    const result = await createUser(userData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test user retrieval endpoint
app.get('/test-user/:userId', async (req, res) => {
  try {
    const result = await getUser(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authentication routes
app.use('/auth', require('./routes/auth'));
app.use('/auth', require('./routes/outlook-auth'));

// Team routes
app.use('/teams', require('./routes/teams'));

// Availability routes
app.use('/availability', require('./routes/availability'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});