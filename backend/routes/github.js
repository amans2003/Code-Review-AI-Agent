const express = require('express');
const router = express.Router();

/**
 * GET /api/github/repos/:username
 * Fetches public repositories of a GitHub user using the public GitHub API.
 * No authentication required.
 */
router.get('/repos/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ success: false, message: 'GitHub username is required.' });
    }

    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'CodeReviewAgent/1.0'
    };

    // Optionally use GITHUB_TOKEN for higher rate limits
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=public`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ success: false, message: `GitHub user "${username}" not found.` });
      }
      if (response.status === 403) {
        return res.status(429).json({ success: false, message: 'GitHub API rate limit exceeded. Please try again shortly.' });
      }
      return res.status(502).json({ success: false, message: 'Failed to fetch repositories from GitHub.' });
    }

    const repos = await response.json();

    // Shape the response to include only necessary fields
    const shaped = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || '',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isPrivate: repo.private,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      updatedAt: repo.updated_at,
      topics: repo.topics || [],
      size: repo.size
    }));

    res.status(200).json({
      success: true,
      count: shaped.length,
      data: shaped
    });
  } catch (error) {
    console.error('GitHub Repos Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching GitHub repositories.' });
  }
});

module.exports = router;
