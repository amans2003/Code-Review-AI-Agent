const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-jwt-key-reviewer', {
    expiresIn: '30d'
  });
};

/**
 * Handles GitHub OAuth redirect and generates a token for the UI
 */
const githubCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    const token = generateToken(req.user._id);
    
    // Redirect to frontend dashboard with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
  } catch (error) {
    console.error('Github Callback Error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
};

/**
 * Generates an instant Developer Demo JWT token
 */
const demoLogin = async (req, res) => {
  try {
    // Find or create a demo user
    let user = await User.findOne({ username: 'demo_developer' });

    if (!user) {
      user = new User({
        username: 'demo_developer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
        email: 'developer@example.com'
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Demo Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during demo login' });
  }
};

/**
 * Retrieves profile of logged-in user
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  githubCallback,
  demoLogin,
  getMe
};
