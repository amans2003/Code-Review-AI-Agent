const express = require('express');
const { loginWithGithubUrl, demoLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Route: Get current user profile
router.get('/me', protect, getMe);

// Route: Login with GitHub Profile URL (no OAuth required)
router.post('/github-url', loginWithGithubUrl);

// Route: Demo Login (instant access with demo user)
router.post('/demo', demoLogin);

module.exports = router;
