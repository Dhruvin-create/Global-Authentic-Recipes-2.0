/**
 * Queue Configuration: BullMQ + Redis Setup
 * 
 * Manages job queues for:
 * - Auto-find recipe generation
 * - Source fetching
 * - AI processing
 * - Moderation tasks
 */

import Queue from 'bull';
import Redis, { Redis as RedisClient } from 'ioredis';

// ============================================
// Redis Connection
// ============================================

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null, // For BullMQ compatibility
  enableReadyCheck: false,
};

let redisClient: RedisClient;
let redisSubscriber: RedisClient;

/**
 * Get or create Redis client
 */
export function getRedisClient(): RedisClient {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);

    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected');
    });

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });
  }

  return redisClient;
}

/**
 * Get or create Redis subscriber (for Pub/Sub)
 */
export function getRedisSubscriber(): RedisClient {
  if (!redisSubscriber) {
    redisSubscriber = new Redis(redisConfig);
  }
  return redisSubscriber;
}

// ============================================
// BullMQ Queues
// ============================================

let autoFindQueue: Queue.Queue;
let sourceFetchQueue: Queue.Queue;
let aiGenerationQueue: Queue.Queue;
let reviewQueue: Queue.Queue;

/**
 * Initialize all queues
 */
export function initializeQueues() {
  const redisOpts = {
    redis: redisConfig,
    settings: {
      maxStalledCount: 3,
      lockDuration: 30000, // 30s lock
      lockRenewTime: 15000, // Renew every 15s
    },
  };

  // Auto-Find Queue: Main entry point for user searches with no results
  autoFindQueue = new Queue('auto-find', redisOpts);
  autoFindQueue.on('active', (job) => {
    console.log(`[Queue] auto-find job ${job.id} started`);
  });
  autoFindQueue.on('completed', (job, result) => {
    console.log(`[Queue] auto-find job ${job.id} completed:`, result);
  });
  autoFindQueue.on('failed', (job, err) => {
    console.error(`[Queue] auto-find job ${job.id} failed:`, err.message);
  });

  // Source Fetch Queue: Internal queue for fetching external sources
  sourceFetchQueue = new Queue('source-fetch', redisOpts);
  sourceFetchQueue.on('completed', (job) => {
    console.log(`[Queue] source-fetch job ${job.id} completed`);
  });
  sourceFetchQueue.on('failed', (job, err) => {
    console.error(`[Queue] source-fetch job ${job.id} failed:`, err.message);
  });

  // AI Generation Queue: Internal queue for AI API calls
  aiGenerationQueue = new Queue('ai-generation', redisOpts);
  aiGenerationQueue.on('completed', (job) => {
    console.log(`[Queue] ai-generation job ${job.id} completed`);
  });
  aiGenerationQueue.on('failed', (job, err) => {
    console.error(`[Queue] ai-generation job ${job.id} failed:`, err.message);
  });

  // Review Queue: Tasks for moderator review
  reviewQueue = new Queue('review', redisOpts);
  reviewQueue.on('created', (job) => {
    console.log(`[Queue] review job ${job.id} created`);
  });

  console.log('[Queue] All queues initialized');
}

/**
 * Get auto-find queue singleton
 */
export function getAutoFindQueue(): Queue.Queue {
  if (!autoFindQueue) {
    initializeQueues();
  }
  return autoFindQueue;
}

/**
 * Get source-fetch queue singleton
 */
export function getSourceFetchQueue(): Queue.Queue {
  if (!sourceFetchQueue) {
    initializeQueues();
  }
  return sourceFetchQueue;
}

/**
 * Get AI generation queue singleton
 */
export function getAIGenerationQueue(): Queue.Queue {
  if (!aiGenerationQueue) {
    initializeQueues();
  }
  return aiGenerationQueue;
}

/**
 * Get review queue singleton
 */
export function getReviewQueue(): Queue.Queue {
  if (!reviewQueue) {
    initializeQueues();
  }
  return reviewQueue;
}

// ============================================
// Queue Export (for convenience)
// ============================================

export const queues = {
  autoFind: () => getAutoFindQueue(),
  sourceFetch: () => getSourceFetchQueue(),
  aiGeneration: () => getAIGenerationQueue(),
  review: () => getReviewQueue(),
};

// ============================================
// Cleanup on process exit
// ============================================

process.on('SIGTERM', async () => {
  console.log('[Queue] Shutting down queues...');
  try {
    if (autoFindQueue) await autoFindQueue.close();
    if (sourceFetchQueue) await sourceFetchQueue.close();
    if (aiGenerationQueue) await aiGenerationQueue.close();
    if (reviewQueue) await reviewQueue.close();
    if (redisClient) await redisClient.quit();
    if (redisSubscriber) await redisSubscriber.quit();
    console.log('[Queue] Queues closed');
  } catch (err) {
    console.error('[Queue] Error during shutdown:', err);
  }
  process.exit(0);
});
