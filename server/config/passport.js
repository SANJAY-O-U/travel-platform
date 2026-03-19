// server/config/passport.js
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope:        ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, { message: 'No email found in Google profile' });
        }

        // Check if user already exists by googleId OR email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email:    email.toLowerCase() },
          ],
        });

        if (user) {
          // If user exists but signed up with email, link Google account
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            if (!user.avatar?.url || user.avatar.url.includes('ui-avatars')) {
              user.avatar = {
                url: profile.photos?.[0]?.value || user.avatar?.url,
              };
            }
            await user.save({ validateBeforeSave: false });
          }
          return done(null, user);
        }

        // Create new user from Google profile
        user = await User.create({
          googleId:        profile.id,
          name:            profile.displayName || 'Google User',
          email:           email.toLowerCase(),
          password:        `google_${profile.id}_${Date.now()}`, // random password
          avatar: {
            url: profile.photos?.[0]?.value || '',
          },
          isEmailVerified: true,
          isActive:        true,
          role:            'user',
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;