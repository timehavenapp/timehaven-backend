const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { createUser, getUser } = require('../utils/database');

const router = express.Router();

// Google OAuth route
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'] })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const userData = {
        id: req.user.id,
        email: req.user.emails[0].value,
        name: req.user.displayName,
        profileImage: req.user.photos[0]?.value,
        timezone: 'America/New_York', // Default timezone
        isActive: true,
        calendarProvider: 'google',
        googleAccessToken: req.user.accessToken,
        googleRefreshToken: req.user.refreshToken
      };

      // Check if user exists, if not create them
      const existingUser = await getUser(userData.id);
      if (!existingUser.success) {
        await createUser(userData);
      } else {
        // Update existing user with new tokens
        // You might want to add an updateUser function to your database utils
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: userData.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Redirect to app with token
      res.redirect(`timehaven://auth?token=${token}&provider=google`);
    } catch (error) {
      console.error('Auth error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

module.exports = router;