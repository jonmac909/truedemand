'use client';

import { useEffect, useState } from 'react';
import type { Job } from '@/lib/db/jobs';

interface JobPollerProps {
  jobId: string;
  onComplete: (job: Job) => void;
  onError?: (error: string) => void;
  pollInterval?: number;
}

/**
 * Job poller component that polls job status and calls onComplete when done.
 * This component is headless - it doesn't render anything, just manages polling logic.
 */
export function JobPoller({ jobId, onComplete, onError, pollInterval = 2000 }: JobPollerProps) {
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!jobId || !isPolling) return;

    let intervalId: NodeJS.Timeout;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch job: ${response.statusText}`);
        }

        const job: Job = await response.json();

        // Check if job is complete or failed
        if (job.status === 'completed') {
          setIsPolling(false);
          onComplete(job);
        } else if (job.status === 'failed') {
          setIsPolling(false);
          onError?.(job.error_message || 'Job failed');
        }
      } catch (error: any) {
        console.error('Error polling job:', error);
        setIsPolling(false);
        onError?.(error.message);
      }
    };

    // Poll immediately
    pollJob();

    // Then poll at interval
    intervalId = setInterval(pollJob, pollInterval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, isPolling, onComplete, onError, pollInterval]);

  return null; // Headless component
}

/**
 * Hook for polling a job
 */
export function useJobPoller(jobId: string | null, pollInterval = 2000) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    setIsPolling(true);
    setError(null);

    let intervalId: NodeJS.Timeout;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch job: ${response.statusText}`);
        }

        const jobData: Job = await response.json();
        setJob(jobData);

        // Stop polling when complete or failed
        if (jobData.status === 'completed' || jobData.status === 'failed') {
          setIsPolling(false);
          if (jobData.status === 'failed') {
            setError(jobData.error_message || 'Job failed');
          }
        }
      } catch (err: any) {
        console.error('Error polling job:', err);
        setError(err.message);
        setIsPolling(false);
      }
    };

    // Poll immediately
    pollJob();

    // Then poll at interval
    intervalId = setInterval(pollJob, pollInterval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, pollInterval]);

  return { job, error, isPolling };
}
