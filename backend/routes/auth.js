const express = require('express');
const passport = require('passport');
const { githubCallback, demoLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Route: Get current user
router.get('/me', protect, getMe);

// Route: Demo Login
router.post('/demo', demoLogin);

// Route: Start GitHub OAuth process
router.get('/github', (req, res, next) => {
  // Safe-guard if strategy wasn't registered because of empty credentials
  if (!passport._strategies.github) {
    return res.status(400).json({
      success: false,
      message: 'GitHub OAuth is not configured in this deployment environment. Please use Demo Login.'
    });
  }
  passport.authenticate('github', { scope: ['user:email', 'read:user'] })(req, res, next);
});

// Route: GitHub OAuth Callback
router.get(
  '/github/callback',
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    passport.authenticate('github', { failureRedirect: `${frontendUrl}/login?error=auth_failed`, session: false })(req, res, next);
  },
  githubCallback
);

module.exports = router;
