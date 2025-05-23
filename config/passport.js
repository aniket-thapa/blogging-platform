const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Local strategy for username and password
passport.use(
  new LocalStrategy(
    {
      usernameField: 'useremail',
      passwordField: 'password',
    },
    async (useremail, password, done) => {
      try {
        const user = await User.findOne({ useremail });
        if (!user || !user.password) {
          return done(null, false, {
            message: 'User not found or invalid login method.',
          });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid Credentials' });
        }

        return done(null, user, { message: 'User login successfully!' });
      } catch (err) {
        console.error('Error in Local strategy:', err);
        return done(err, false);
      }
    }
  )
);

// Google strategy for OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            googleId: profile.id,
            username: profile.displayName.toLowerCase(),
            useremail: profile.emails[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        console.error('Error in Google strategy:', err);
        return done(err);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error in deserializing user:', err);
    done(err, false);
  }
});

module.exports = passport;
