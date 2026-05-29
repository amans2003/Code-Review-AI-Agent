const express = require('express');
const {
  getReviews,
  getReviewDetails,
  downloadPDFReport,
  explainSnippet,
  exportMarkdownReport
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Fetch all user reviews
router.get('/', protect, getReviews);

// Code explainer AI chat assistant
router.post('/explain', protect, explainSnippet);

// Details of a single review
router.get('/:id', protect, getReviewDetails);

// PDF Download
router.get('/:id/pdf', protect, downloadPDFReport);

// Markdown Export
router.get('/:id/markdown', protect, exportMarkdownReport);

module.exports = router;
