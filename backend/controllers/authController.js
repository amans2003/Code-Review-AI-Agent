const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-jwt-key-reviewer', {
    expiresIn: '30d'
  });
};

// Shared GitHub API headers
const githubHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'CodeReviewAgent/1.0'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

/**
 * Login via GitHub Profile URL — no OAuth required.
 * Body: { profileUrl: "https://github.com/username" }
 */
const loginWithGithubUrl = async (req, res) => {
  try {
    const { profileUrl } = req.body;

    // ── Step 1: Validate input ─────────────────────────────────────────────
    if (!profileUrl || typeof profileUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid GitHub profile URL.'
      });
    }

    const cleaned = profileUrl.trim().replace(/\/$/, '');
    const match = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);

    if (!match || !match[1]) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract a GitHub username from the URL. Use format: https://github.com/username'
      });
    }
    const githubUsername = match[1];

    // ── Step 2: Fetch from GitHub public API ───────────────────────────────
    let githubProfile;
    try {
      const response = await axios.get(
        `https://api.github.com/users/${githubUsername}`,
        { headers: githubHeaders(), timeout: 10000 }
      );
      githubProfile = response.data;
    } catch (axiosErr) {
      const status = axiosErr.response?.status;
      console.error(`[auth/github-url] GitHub API error: status=${status}, msg=${axiosErr.message}`);

      if (status === 404) {
        return res.status(404).json({
          success: false,
          message: `GitHub user "${githubUsername}" not found. Please check the URL.`
        });
      }
      if (status === 403) {
        return res.status(429).json({
          success: false,
          message: 'GitHub API rate limit reached. Try again shortly or set GITHUB_TOKEN env variable.'
        });
      }
      return res.status(502).json({
        success: false,
        message: 'Failed to reach the GitHub API. Please try again.'
      });
    }

    // ── Step 3: Find or create user (upsert avoids duplicate key races) ────
    let user;
    try {
      user = await User.findOneAndUpdate(
        { username: githubProfile.login },
        {
          $set: {
            avatar: githubProfile.avatar_url || '',
            email: githubProfile.email || ''
          },
          $setOnInsert: {
            username: githubProfile.login,
            createdAt: new Date()
          }
        },
        { upsert: true, new: true, runValidators: true }
      );
    } catch (dbErr) {
      console.error('[auth/github-url] Database error:', dbErr.message, dbErr.code);
      return res.status(500).json({
        success: false,
        message: 'Database error while creating user session.'
      });
    }

    // ── Step 4: Issue JWT and respond ─────────────────────────────────────
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        githubName: githubProfile.name || user.username,
        bio: githubProfile.bio || '',
        publicRepos: githubProfile.public_repos || 0,
        followers: githubProfile.followers || 0,
        following: githubProfile.following || 0,
        githubUrl: githubProfile.html_url || `https://github.com/${user.username}`
      }
    });

  } catch (error) {
    console.error('[auth/github-url] Unexpected error:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error during login.'
    });
  }
};

/**
 * Demo login — instant access without a real GitHub profile
 */
const demoLogin = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: 'demo_developer' },
      {
        $set: {
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
          email: 'developer@example.com'
        },
        $setOnInsert: {
          username: 'demo_developer',
          createdAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        githubName: 'Demo Developer',
        bio: 'Exploring the Code Review Agent',
        publicRepos: 0,
        followers: 0,
        following: 0,
        githubUrl: 'https://github.com'
      }
    });
  } catch (error) {
    console.error('[auth/demo] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during demo login.' });
  }
};

/**
 * Retrieves profile of the logged-in user (JWT-protected)
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('[auth/me] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  loginWithGithubUrl,
  demoLogin,
  getMe
};
