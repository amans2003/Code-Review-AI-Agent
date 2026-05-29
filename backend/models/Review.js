const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  file: {
    type: String,
    required: true
  },
  line: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  },
  category: {
    type: String,
    enum: ['security', 'performance', 'cleanCode', 'architecture'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  suggestion: {
    type: String,
    default: ''
  },
  proposedFix: {
    type: String,
    default: ''
  }
});

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  securityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  performanceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  cleanCodeScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  architectureScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  issues: [IssueSchema],
  suggestions: {
    type: [String],
    default: []
  },
  summary: {
    type: String,
    default: ''
  },
  files: [{
    path: { type: String, required: true },
    content: { type: String, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
