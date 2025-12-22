import type { JobHandlerRegistry } from './types';
import { handleMockJob } from './mock-job';
import { handleValidation } from './validation';
import { handleIdeaGeneration } from './idea-generation';
import { handleBlueprintCreation } from './blueprint-creation';

/**
 * Registry of all job handlers.
 * Add new handlers here as they are implemented.
 */
export const jobHandlers: JobHandlerRegistry = {
  mock_job: handleMockJob,
  validation: handleValidation,
  idea_generation: handleIdeaGeneration,
  blueprint_creation: handleBlueprintCreation,
};
