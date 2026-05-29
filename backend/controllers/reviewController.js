const Review = require('../models/Review');
const Repository = require('../models/Repository');
const User = require('../models/User');
const { generateReviewPDF } = require('../utils/pdfGenerator');
const { explainCodeSnippet } = require('../services/ai/agentService');

/**
 * Get all reviews for the current user (e.g. for listing in Dashboard)
 */
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('repositoryId', 'repoName repoUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get details of a single code review by ID
 */
const getReviewDetails = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('repositoryId', 'repoName repoUrl owner');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review report not found' });
    }

    // Ensure the review belongs to the user
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Get Review Details Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Export code review report as a PDF download
 */
const downloadPDFReport = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('repositoryId');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review report not found' });
    }

    // Ensure the review belongs to the user
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=AI-Review-Report-${review._id}.pdf`);

    // Stream PDF generation directly to Express Response
    generateReviewPDF(review, review.repositoryId, req.user, res);

  } catch (error) {
    console.error('PDF Download Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate PDF report' });
    }
  }
};

/**
 * Chat with AI to explain a specific code snippet
 */
const explainSnippet = async (req, res) => {
  try {
    const { fileName, snippet, question } = req.body;

    if (!fileName || !snippet || !question) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: fileName, snippet, or question.'
      });
    }

    const explanation = await explainCodeSnippet(fileName, snippet, question);
    res.status(200).json({ success: true, explanation });
  } catch (error) {
    console.error('Explain Snippet Error:', error);
    res.status(500).json({ success: false, message: 'AI Assistant failed to generate explanation' });
  }
};

/**
 * Export code review as Markdown file
 */
const exportMarkdownReport = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('repositoryId');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review report not found' });
    }

    // Format markdown text
    let md = `# AI Code Review Report — ${review.repositoryId.repoName}\n\n`;
    md += `* **Overall Score**: ${review.overallScore}/100\n`;
    md += `* **Security Score**: ${review.securityScore}/100\n`;
    md += `* **Performance Score**: ${review.performanceScore}/100\n`;
    md += `* **Clean Code Score**: ${review.cleanCodeScore}/100\n`;
    md += `* **Architecture Score**: ${review.architectureScore}/100\n`;
    md += `* **Created At**: ${new Date(review.createdAt).toLocaleString()}\n\n`;
    
    md += `${review.summary}\n\n`;
    md += `## Detailed Findings Log (${review.issues.length} Issues)\n\n`;

    review.issues.forEach((issue, idx) => {
      md += `### ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.category.toUpperCase()} issue in \`${issue.file}\` (Line ${issue.line})\n`;
      md += `* **Message**: ${issue.message}\n`;
      md += `* **Code Snippet**:\n\`\`\`javascript\n${issue.code}\n\`\`\`\n`;
      md += `* **Recommendation**: ${issue.suggestion}\n\n`;
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=AI-Review-Report-${review._id}.md`);
    res.status(200).send(md);
  } catch (error) {
    console.error('Markdown Export Error:', error);
    res.status(500).json({ success: false, message: 'Failed to export markdown report' });
  }
};

module.exports = {
  getReviews,
  getReviewDetails,
  downloadPDFReport,
  explainSnippet,
  exportMarkdownReport
};
