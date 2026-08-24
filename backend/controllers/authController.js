const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-jwt-key-reviewer', {
    expiresIn: '30d'
  });
};

// Shared GitHub API axios headers
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
 * Login via GitHub Profile URL (no OAuth required).
 * Accepts { profileUrl } in request body, calls GitHub public API,
 * finds or creates user in MongoDB, returns a JWT.
 */
const loginWithGithubUrl = async (req, res) => {
  try {
    const { profileUrl } = req.body;

    if (!profileUrl || typeof profileUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid GitHub profile URL.' });
    }

    // Extract username from URL like https://github.com/username or github.com/username
    const cleaned = profileUrl.trim().replace(/\/$/, '');
    const match = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);

    if (!match || !match[1]) {
      return res.status(400).json({ success: false, message: 'Could not extract a GitHub username from the provided URL.' });
    }

    const githubUsername = match[1];

    // Fetch public profile from GitHub API using axios
    let githubProfile;
    try {
      const response = await axios.get(`https://api.github.com/users/${githubUsername}`, {
        headers: githubHeaders(),
        timeout: 10000
      });
      githubProfile = response.data;
    } catch (axiosErr) {
      if (axiosErr.response) {
        if (axiosErr.response.status === 404) {
          return res.status(404).json({ success: false, message: `GitHub user "${githubUsername}" not found. Please check the URL.` });
        }
        if (axiosErr.response.status === 403) {
          return res.status(429).json({ success: false, message: 'GitHub API rate limit exceeded. Please try again shortly.' });
        }
      }
      console.error('GitHub API request failed:', axiosErr.message);
      return res.status(502).json({ success: false, message: 'Failed to reach GitHub API. Please try again.' });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ username: githubProfile.login });

    if (!user) {
      user = new User({
        username: githubProfile.login,
        avatar: githubProfile.avatar_url || '',
        email: githubProfile.email || ''
      });
      await user.save();
    } else {
      // Update avatar/email in case they changed
      user.avatar = githubProfile.avatar_url || user.avatar;
      user.email = githubProfile.email || user.email;
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
    console.error('Login With GitHub URL Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * Generates an instant Developer Demo JWT token
 */
const demoLogin = async (req, res) => {
  try {
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
  loginWithGithubUrl,
  demoLogin,
  getMe
};
