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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'TimeHaven backend is running!' });
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        // Test by trying to create a test user
        const testUserData = {
            id: 'test-' + Date.now(),
            name: 'Test User',
            email: 'test@example.com',
            timezone: 'America/New_York'
        };
        
        const result = await createUser(testUserData);
        res.json({ 
            status: 'ok', 
            message: 'Database connection and operations successful!',
            testResult: result
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'TimeHaven backend is running!' });
});

// Import database functions
const { createUser, getUser } = require('./utils/database');

// Import email service
const emailService = require('./utils/emailService');

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

// Test email endpoint
app.post('/test-email', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and name are required' 
            });
        }
        
        const result = await emailService.sendWelcomeEmail(email, name);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Simple contact test route
app.get('/api/contact-test', (req, res) => {
    console.log(' Debug: Contact test route hit');
    res.json({ message: 'Contact test route is working!' });
});

// Contact form endpoint - FIXED: Now accepts formData object
app.post('/api/contact', async (req, res) => {
    console.log(' Debug: Contact form endpoint hit');
    console.log(' Debug: Request body:', req.body);
    console.log(' Debug: Email service loaded:', !!emailService);
    
    try {
        const { name, email, subject, message } = req.body;
        
        console.log(' Debug: Extracted data:', { name, email, subject, message });
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required: name, email, subject, message' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide a valid email address' 
            });
        }
        
        console.log(' Debug: About to call emailService.sendContactForm');
        
        // Send contact form email - FIXED: Pass formData object
        const result = await emailService.sendContactForm({ name, email, subject, message });
        
        console.log(' Debug: Email service result:', result);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Contact form submitted successfully! We\'ll get back to you soon.',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Failed to send contact form. Please try again later.' 
            });
        }
        
    } catch (error) {
        console.error('❌ Error processing contact form:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error. Please try again later.' 
        });
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