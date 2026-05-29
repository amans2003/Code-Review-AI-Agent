const mongoose = require('mongoose');

const RepositorySchema = new mongoose.Schema({
  repoName: {
    type: String,
    required: true
  },
  repoUrl: {
    type: String,
    default: ''
  },
  owner: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Repository', RepositorySchema);
