const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const reviewQueueController = require('../queues/reviewQueue');
const sseManager = require('../services/streaming/sseManager');
const cloneService = require('../services/github/cloneService');
const agentService = require('../services/ai/agentService');

const Repository = require('../models/Repository');
const Review = require('../models/Review');

/**
 * Common logic to perform code review scanning and AI updates
 */
const performReviewJob = async (jobId, data) => {
  const { repositoryId, userId, repoUrl, files: manualFiles, repoName } = data;
  let filesToReview = [];

  try {
    sseManager.send(jobId, 'started', 'Initializing analysis parameters...');

    if (repoUrl) {
      // Flow 1: Clone GitHub Repo
      sseManager.send(jobId, 'cloning', `Cloning repository: ${repoUrl}...`);
      const clonedPath = await cloneService.cloneRepository(repoUrl, jobId);
      
      sseManager.send(jobId, 'scanning', 'Scanning repository directories...');
      filesToReview = cloneService.scanDirectory(clonedPath);
      
      // Cleanup cloned repo files after reading them
      cloneService.cleanup(jobId);
    } else if (manualFiles && manualFiles.length > 0) {
      // Flow 2: Manual File uploads / Pasted code blocks
      sseManager.send(jobId, 'scanning', `Analyzing ${manualFiles.length} uploaded file(s)...`);
      filesToReview = manualFiles;
    } else {
      throw new Error('No files or repository URL provided for review');
    }

    if (filesToReview.length === 0) {
      throw new Error('No matching source code files (.js, .ts, .jsx, .tsx) found to analyze');
    }

    sseManager.send(jobId, 'agents-init', `Preparing review for ${filesToReview.length} file(s)...`);

    // Run AI multi-agent check. Pass callback to stream agents progress
    const reviewData = await agentService.runReview(filesToReview, (agent, message) => {
      sseManager.send(jobId, agent, message);
    });

    sseManager.send(jobId, 'saving', 'Saving analysis results to database...');

    // Save final results in MongoDB
    const newReview = new Review({
      userId,
      repositoryId,
      securityScore: reviewData.securityScore,
      performanceScore: reviewData.performanceScore,
      cleanCodeScore: reviewData.cleanCodeScore,
      architectureScore: reviewData.architectureScore,
      overallScore: reviewData.overallScore,
      issues: reviewData.issues,
      suggestions: reviewData.suggestions,
      summary: reviewData.summary,
      files: filesToReview
    });

    await newReview.save();

    sseManager.send(jobId, 'completed', {

      reviewId: newReview._id,
      scores: {
        security: reviewData.securityScore,
        performance: reviewData.performanceScore,
        cleanCode: reviewData.cleanCodeScore,
        architecture: reviewData.architectureScore,
        overall: reviewData.overallScore
      }
    });

  } catch (error) {
    console.error(`Worker: Error during job ${jobId}:`, error);
    sseManager.send(jobId, 'failed', error.message || 'An unknown error occurred during code analysis');
  } finally {
    // Ensure any remaining temp folder is removed
    cloneService.cleanup(jobId);
    // Unregister SSE client after delay
    setTimeout(() => {
      sseManager.unregister(jobId);
    }, 5000);
  }
};

// 1. Hook up local in-memory Queue processing listener
reviewQueueController.localQueue.on('process', async (job) => {
  await performReviewJob(job.id, job.data);

});

// 2. Hook up BullMQ worker if Redis client gets connected
let bullWorker = null;

const setupBullWorker = () => {
  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

  // We connect to Redis separately for the worker
  const connection = new (require('ioredis'))({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
    retryStrategy: () => null // Don't loop infinitely if offline
  });
  connection.on('connect', () => {
    bullWorker = new Worker('review-queue', async (job) => {
      await performReviewJob(job.id, job.data);
    }, { connection });

    bullWorker.on('failed', (job, err) => {
      console.error(`BullMQ Worker: Job ${job.id} failed:`, err);
    });
  });

  connection.on('error', () => {
    // Suppress warnings
  });
};

// Delay worker connection slightly to give main queue connection priority
setTimeout(() => {
  setupBullWorker();
}, 2000);

module.exports = {
  performReviewJob
};
