import type { JobHandlerRegistry } from './types';
import { handleMockJob } from './mock-job';
import { handleValidation } from './validation';
import { handleIdeaGeneration } from './idea-generation';
import { handleBlueprintCreation } from './blueprint-creation';
import { makeIdempotent } from './idempotent-wrapper';

/**
 * Registry of all job handlers (C1 Hardened).
 * All handlers are wrapped with idempotent wrapper to prevent duplicate execution.
 * Add new handlers here as they are implemented.
 */
export const jobHandlers: JobHandlerRegistry = {
  mock_job: makeIdempotent(handleMockJob),
  validation: makeIdempotent(handleValidation),
  idea_generation: makeIdempotent(handleIdeaGeneration),
  blueprint_creation: makeIdempotent(handleBlueprintCreation),
};
