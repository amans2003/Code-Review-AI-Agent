const { Queue } = require('bullmq');
const Redis = require('ioredis');
const { EventEmitter } = require('events');
const crypto = require('crypto');

// Keep an event emitter to notify when in-memory tasks are running
class LocalQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
  }

  add(name, data, opts = {}) {
    const jobId = opts.jobId || crypto.randomUUID();
    const job = {
      id: jobId,
      name,
      data,
      status: 'waiting',
      progress: 0,
      createdAt: new Date()
    };
    this.jobs.set(jobId, job);
    
    // Process asynchronously
    setTimeout(() => {
      this.emit('process', job);
    }, 50);

    return job;
  }
}

class ReviewQueueController {
  constructor() {
    this.isRedisActive = false;
    this.redisClient = null;
    this.bullQueue = null;
    this.localQueue = new LocalQueue();
    
    this.init();
  }

  async init() {
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);


    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      maxRetriesPerRequest: null,
      showFriendlyErrorStack: true,
      connectTimeout: 2000, // Quick timeout so we don't block
      retryStrategy: (times) => {
        if (times > 1) {
          // If we fail once, we stop retrying and fall back to in-memory mode
          this.isRedisActive = false;

          return null; // Stop retrying
        }
        return 1000;
      }
    });

    this.redisClient.on('connect', () => {
      this.isRedisActive = true;
      this.bullQueue = new Queue('review-queue', {
        connection: this.redisClient
      });
    });

    this.redisClient.on('error', (err) => {
      // Catch errors silently to prevent application crashes
      if (!this.isRedisActive) {
        // Suppress duplicate error logs
      }

    });
  }

  /**
   * Push a code review request to the queue
   * @param {object} data - { repositoryId, userId, repoUrl, files, gitName }
   * @returns {Promise<string>} jobId
   */
  async addReviewJob(data) {
    const jobId = crypto.randomUUID();
    
    if (this.isRedisActive && this.bullQueue) {
      await this.bullQueue.add('review-job', data, { jobId });
    } else {
      this.localQueue.add('review-job', data, { jobId });
    }

    return jobId;
  }
}

module.exports = new ReviewQueueController();
