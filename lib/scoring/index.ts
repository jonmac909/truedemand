/**
 * B2 Explainable Scoring System
 *
 * This module provides a configurable, auditable scoring system for market validations.
 *
 * Features:
 * - Explainable scoring with per-factor breakdown
 * - Configurable weights (with sensible defaults)
 * - Insufficient data handling
 * - Re-scoring support
 * - Full auditability (stores weights used, timestamp, etc.)
 *
 * Usage:
 *
 * ```typescript
 * // Re-score an existing validation
 * import { rescoreValidation } from '@/lib/scoring';
 *
 * const result = await rescoreValidation('validation-uuid', {
 *   weights: { pain: 0.35, monetization: 0.30, trend: 0.20, competition: 0.15 },
 *   persist: true
 * });
 *
 * console.log(result.overallScore); // 0-100
 * console.log(result.summary); // Human-readable explanation
 * console.log(result.factorExplanations); // Per-factor breakdown
 * ```
 */

export * from './types';
export * from './config';
export * from './explainable-score';
export * from './rescore-validation';
