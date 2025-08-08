   const passport = require('passport');
   const MicrosoftStrategy = require('passport-microsoft').Strategy;

   // Configure Microsoft OAuth strategy
   passport.use('microsoft', new MicrosoftStrategy({
       clientID: process.env.OUTLOOK_CLIENT_ID,
       clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
       callbackURL: "http://localhost:3000/auth/outlook/callback",
       scope: ['user.read', 'calendars.read', 'calendars.readwrite']
     },
     async (accessToken, refreshToken, profile, done) => {
       try {
         console.log('Microsoft OAuth callback received:', profile);
         
         // Safely handle the profile data
         const userProfile = {
           id: profile.id,
           displayName: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName || 'Unknown User',
           emails: profile.emails && profile.emails.length > 0 ? [{ value: profile.emails[0].value }] : [{ value: 'no-email@example.com' }],
           photos: profile.photos && profile.photos.length > 0 ? [{ value: profile.photos[0].value }] : []
         };
         
         console.log('Processed user profile:', userProfile);
         
         // Return the user profile from Microsoft
         return done(null, userProfile);
       } catch (error) {
         console.error('Microsoft OAuth error:', error);
         return done(error, null);
       }
     }
   ));

   module.exports = passport;