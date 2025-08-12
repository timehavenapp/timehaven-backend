const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  // For now, we'll just pass the ID
  // In a real app, you'd fetch the user from database
  done(null, { id });
});

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? "https://timehaven-backend.onrender.com/auth/google/callback"
      : "http://localhost:3000/auth/google/callback",
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Store access token for calendar operations
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      
      // Return the user profile from Google
      return done(null, profile);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;