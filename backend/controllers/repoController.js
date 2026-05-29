const Repository = require('../models/Repository');
const reviewQueue = require('../queues/reviewQueue');
const mockAi = require('../utils/mockAi');
const agentService = require('../services/ai/agentService');

/**
 * Submit a repository or files for code review
 */
const submitReview = async (req, res) => {
  try {
    const { repoUrl, repoName, files } = req.body;
    const userId = req.user._id;

    if (!repoUrl && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a GitHub repository URL or manual files to review.'
      });
    }

    // Determine repo name
    let name = repoName;
    if (!name && repoUrl) {
      // Extract from URL: e.g. https://github.com/user/repo.git -> repo
      const parts = repoUrl.replace(/\.git$/, '').split('/');
      name = parts[parts.length - 1] || 'unnamed_repository';
    } else if (!name) {
      name = 'Manual_Upload_' + new Date().toLocaleDateString().replace(/\//g, '-');
    }

    // Save Repository details
    const repository = new Repository({
      repoName: name,
      repoUrl: repoUrl || '',
      owner: repoUrl ? repoUrl.split('github.com/')[1]?.split('/')[0] || 'unknown' : 'local',
      userId
    });

    await repository.save();

    // Add job to Queue
    const jobData = {
      repositoryId: repository._id,
      userId,
      repoUrl: repoUrl || null,
      repoName: name,
      files: files || null
    };

    const jobId = await reviewQueue.addReviewJob(jobData);

    res.status(200).json({
      success: true,
      message: 'Review request successfully added to the processing queue.',
      jobId,
      repositoryId: repository._id
    });

  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ success: false, message: 'Failed to queue review request' });
  }
};

/**
 * Get all repositories submitted by the user
 */
const getRepositories = async (req, res) => {
  try {
    const repos = await Repository.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: repos.length, data: repos });
  } catch (error) {
    console.error('Get Repositories Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Audit code block instantly without registering queue jobs or database rows
 */
const quickAudit = async (req, res) => {
  try {
    const { content, fileName } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Missing code content to analyze.' });
    }
    const files = [{ path: fileName || 'sandbox.js', content }];
    
    // Evaluate using Gemini or Local heuristics
    const geminiKey = process.env.GEMINI_API_KEY;
    let reviewData;
    if (geminiKey && geminiKey.startsWith('AIzaSy')) {
      reviewData = await agentService.runReview(files);
    } else {
      reviewData = mockAi.analyzeFiles(files);
    }

    res.status(200).json({ success: true, data: reviewData });
  } catch (error) {
    console.error('Quick Audit Error:', error);
    res.status(500).json({ success: false, message: 'Sandbox analysis failed: ' + error.message });
  }
};

module.exports = {
  submitReview,
  getRepositories,
  quickAudit
};
