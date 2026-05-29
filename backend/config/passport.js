const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configure GitHub OAuth strategy if credentials are provided
const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const callbackURL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

if (clientID && clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID,
        clientSecret,
        callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Create new user in DB
          user = new User({
            githubId: profile.id,
            username: profile.username || profile.displayName || 'github_user',
            avatar: profile.photos?.[0]?.value || '',
            email: profile.emails?.[0]?.value || ''
          });

          await user.save();
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
  console.log('Passport: GitHub OAuth Strategy initialized.');
} else {
  console.warn('Passport: GitHub OAuth credentials missing. OAuth strategy is not registered. Demo Login fallback will be active.');
}

module.exports = passport;
