import type { JobHandlerRegistry } from './types';
import { handleMockJob } from './mock-job';

/**
 * Registry of all job handlers.
 * Add new handlers here as they are implemented.
 */
export const jobHandlers: JobHandlerRegistry = {
  mock_job: handleMockJob,
  // Future handlers will be added here:
  // sub_niche_discovery: handleSubNicheDiscovery,
  // validation: handleValidation,
  // idea_generation: handleIdeaGeneration,
  // blueprint_creation: handleBlueprintCreation,
};
