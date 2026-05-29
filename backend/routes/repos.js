const express = require('express');
const { submitReview, getRepositories, quickAudit } = require('../controllers/repoController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, submitReview)
  .get(protect, getRepositories);

router.post('/quick-audit', quickAudit);

module.exports = router;
