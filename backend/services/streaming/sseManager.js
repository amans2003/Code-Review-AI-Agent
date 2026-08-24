class SSEManager {
  constructor() {
    this.clients = new Map();
  }

  /**
   * Register a new client for a specific scan job
   * @param {string} jobId 
   * @param {object} res - Express Response object 
   */
  register(jobId, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Prevent Nginx buffering SSE
    });

    res.write('retry: 10000\n\n');
    res.write(`data: ${JSON.stringify({ status: 'connected', jobId })}\n\n`);

    this.clients.set(jobId, res);

    const keepAliveInterval = setInterval(() => {
      if (this.clients.has(jobId)) {
        res.write(': ping\n\n');
      } else {
        clearInterval(keepAliveInterval);
      }
    }, 30000);

    reqConnectionCloseListener: {
      // Find the request object if it was passed, or attach the listener on close
      res.on('close', () => {
        clearInterval(keepAliveInterval);
        this.unregister(jobId);
      });
    }
  }

  /**
   * Send progress update to the client
   * @param {string} jobId 
   * @param {string} status - e.g., 'cloning', 'scanning', 'security', 'completed', 'error'
   * @param {object|string} message - description or payload
   */
  send(jobId, status, message) {
    const res = this.clients.get(jobId);
    if (!res) {
      return;

    }

    const payload = {
      timestamp: new Date().toISOString(),
      status,
      message
    };

    res.write(`event: progress\ndata: ${JSON.stringify(payload)}\n\n`);
  }

  /**
   * Safely close the client stream
   * @param {string} jobId 
   */
  unregister(jobId) {
    const res = this.clients.get(jobId);
    if (res) {
      try {
        res.write(`event: close\ndata: ${JSON.stringify({ status: 'closed' })}\n\n`);
        res.end();
      } catch (e) {
        // Already closed
      }
      this.clients.delete(jobId);
    }
  }
}

// Export single instance
module.exports = new SSEManager();
