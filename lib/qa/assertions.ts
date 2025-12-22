/**
 * C3 QA - Runtime Assertions
 *
 * Lightweight runtime checks that fail fast on invalid states.
 * These help surface issues immediately rather than silently failing.
 */

/**
 * Assert that a value is defined (not null or undefined).
 * Throws with descriptive error if assertion fails.
 */
export function assertDefined<T>(
  value: T | null | undefined,
  fieldName: string,
  context?: string
): asserts value is T {
  if (value === null || value === undefined) {
    const contextMsg = context ? ` (${context})` : '';
    throw new Error(`Required field "${fieldName}" is missing${contextMsg}`);
  }
}

/**
 * Assert that a value is a non-empty string.
 */
export function assertNonEmptyString(
  value: unknown,
  fieldName: string,
  context?: string
): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    const contextMsg = context ? ` (${context})` : '';
    throw new Error(`Field "${fieldName}" must be a non-empty string${contextMsg}`);
  }
}

/**
 * Assert that a score is valid (0-100).
 */
export function assertValidScore(
  score: unknown,
  fieldName: string,
  context?: string
): asserts score is number {
  if (typeof score !== 'number' || score < 0 || score > 100 || !Number.isFinite(score)) {
    const contextMsg = context ? ` (${context})` : '';
    throw new Error(`Field "${fieldName}" must be a valid score (0-100), got: ${score}${contextMsg}`);
  }
}

/**
 * Assert that an object has all required keys.
 */
export function assertHasKeys<T extends Record<string, any>>(
  obj: T,
  requiredKeys: (keyof T)[],
  context?: string
): void {
  const missingKeys = requiredKeys.filter((key) => !(key in obj) || obj[key] === undefined);

  if (missingKeys.length > 0) {
    const contextMsg = context ? ` (${context})` : '';
    throw new Error(`Missing required keys: ${missingKeys.join(', ')}${contextMsg}`);
  }
}

/**
 * Assert that a value is one of the allowed values.
 */
export function assertOneOf<T>(
  value: unknown,
  allowedValues: T[],
  fieldName: string,
  context?: string
): asserts value is T {
  if (!allowedValues.includes(value as T)) {
    const contextMsg = context ? ` (${context})` : '';
    throw new Error(
      `Field "${fieldName}" must be one of: ${allowedValues.join(', ')}. Got: ${value}${contextMsg}`
    );
  }
}

/**
 * Assert that data is sufficient (not explicitly marked as "insufficient data").
 */
export function assertSufficientData(
  data: any,
  context: string
): void {
  if (
    !data ||
    data === 'insufficient data' ||
    (typeof data === 'string' && data.toLowerCase().includes('insufficient'))
  ) {
    throw new Error(`Insufficient data for ${context}`);
  }
}
