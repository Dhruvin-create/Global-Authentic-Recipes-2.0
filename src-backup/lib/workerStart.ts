/**
 * Worker Process: Process Background Jobs
 * 
 * This should run as a separate Node.js process (not in the main API server).
 * Processes:
 * - Auto-find recipe generation
 * - Source fetching
 * - AI generation
 * - Review tasks
 * 
 * Start with: node ./workers/processJobs.js
 * Or in production, use PM2/systemd to manage this worker process.
 */

import { getAutoFindQueue, getSourceFetchQueue, getAIGenerationQueue } from '@/lib/queue';
import { processAutoFindJob, handleJobFailure } from '@/lib/autoFindWorker';

/**
 * Initialize and start worker processors
 */
export async function startWorkers() {
  console.log('[Worker] Starting background job processors...');

  try {
    // ============================================
    // Auto-Find Job Processor
    // ============================================
    const autoFindQueue = getAutoFindQueue();

    await autoFindQueue.process('find-and-generate', 1, async (job) => {
      console.log(`[Worker] Processing auto-find job ${job.id}`);
      return await processAutoFindJob(job);
    });

    autoFindQueue.on('failed', (job, err) => {
      console.error(`[Worker] Auto-find job ${job?.id} failed:`, err.message);
      if (job) {
        handleJobFailure(job, err);
      }
    });

    autoFindQueue.on('completed', (job) => {
      console.log(`[Worker] Auto-find job ${job.id} completed successfully`);
    });

    // ============================================
    // Cleanup: Drain queues on shutdown
    // ============================================
    process.on('SIGTERM', async () => {
      console.log('[Worker] Received SIGTERM, closing queues...');
      try {
        await autoFindQueue.close();
        console.log('[Worker] Queues closed');
        process.exit(0);
      } catch (err) {
        console.error('[Worker] Error closing queues:', err);
        process.exit(1);
      }
    });

    console.log('[Worker] All processors ready');
  } catch (error) {
    console.error('[Worker] Failed to start:', error);
    process.exit(1);
  }
}

// Auto-start if run directly
if (require.main === module) {
  startWorkers();
}
