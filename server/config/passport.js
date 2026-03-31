// server/config/passport.js  ← NEW FILE
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from Google'), null);

    // Find existing user or create new one
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name:            profile.displayName,
        email,
        password:        require('crypto').randomBytes(32).toString('hex'), // random, unusable password
        googleId:        profile.id,
        isEmailVerified: true,
        avatar:          { url: profile.photos?.[0]?.value || '' },
      });
    } else if (!user.googleId) {
      // Link Google to existing account
      user.googleId        = profile.id;
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;