/**
 * C2 Export System
 *
 * Utilities for exporting blueprints and derived marketing plans to Markdown.
 *
 * Key Principles:
 * - Blueprints are the canonical stored artifact
 * - Marketing plans are derived on-demand from blueprint.gtm_recommendations
 * - All exports include citations, timestamps, and version metadata
 * - No separate marketing_plans table - derived exports only
 */

export * from './types';
export * from './blueprint-to-markdown';
export * from './marketing-plan-to-markdown';

/**
 * Current export version for backward compatibility
 */
export const EXPORT_VERSION = '1.0.0';

/**
 * Application version (can be read from package.json or hardcoded)
 */
export const APP_VERSION = '1.0.0';
