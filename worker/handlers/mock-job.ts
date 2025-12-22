import type { Job } from '../../lib/db/jobs';
import { updateJobProgress } from '../../lib/db/jobs';

/**
 * Mock job handler that simulates long-running work with progress updates.
 * Used for testing the worker system and demonstrating progress tracking.
 *
 * Simulates 5 steps with random delays, updating progress from 0 to 100.
 */
export async function handleMockJob(job: Job): Promise<Record<string, any>> {
  const steps = [
    { name: 'Initializing', progress: 10, delay: 1000 },
    { name: 'Processing data', progress: 30, delay: 1500 },
    { name: 'Running analysis', progress: 60, delay: 2000 },
    { name: 'Generating results', progress: 85, delay: 1200 },
    { name: 'Finalizing', progress: 95, delay: 800 },
  ];

  await updateJobProgress(job.id, 0, 'Mock job started');

  for (const step of steps) {
    await sleep(step.delay);
    await updateJobProgress(
      job.id,
      step.progress,
      `${step.name}... (${step.progress}%)`
    );
  }

  // Simulate generating some result data
  const resultData = {
    mock: true,
    input_received: job.input_data,
    execution_time_ms: steps.reduce((sum, s) => sum + s.delay, 0),
    timestamp: new Date().toISOString(),
    message: 'Mock job completed successfully',
  };

  return resultData;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
