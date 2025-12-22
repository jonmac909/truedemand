/**
 * Prompt Template Engine
 *
 * Renders prompt templates with variable interpolation
 * Supports {{variable}} syntax
 */

/**
 * Render a prompt template with the provided variables
 *
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns Rendered prompt string
 * @throws Error if required variables are missing
 */
export function renderTemplate(
  template: string,
  variables: Record<string, any>
): string {
  // Find all {{variable}} placeholders
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const matches = [...template.matchAll(placeholderRegex)];

  // Check for missing variables
  const missingVars: string[] = [];
  for (const match of matches) {
    const varName = match[1].trim();
    if (!(varName in variables)) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required variables: ${missingVars.join(', ')}`
    );
  }

  // Replace all placeholders with values
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const valueStr = typeof value === 'string'
      ? value
      : JSON.stringify(value, null, 2);
    rendered = rendered.replace(new RegExp(placeholder, 'g'), valueStr);
  }

  return rendered;
}

/**
 * Extract variable names from a template
 *
 * @param template - Template string with {{variable}} placeholders
 * @returns Array of variable names found in the template
 */
export function extractVariables(template: string): string[] {
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const matches = [...template.matchAll(placeholderRegex)];
  const variables = matches.map(m => m[1].trim());

  // Return unique variables
  return [...new Set(variables)];
}

/**
 * Validate that all required variables are provided
 *
 * @param template - Template string
 * @param variables - Provided variables
 * @param schema - Input schema (optional, for additional validation)
 * @returns Object with isValid flag and list of missing/invalid variables
 */
export function validateVariables(
  template: string,
  variables: Record<string, any>,
  schema?: Record<string, any>
): {
  isValid: boolean;
  missingVariables: string[];
  invalidVariables: string[];
} {
  const requiredVars = extractVariables(template);
  const missingVariables: string[] = [];
  const invalidVariables: string[] = [];

  // Check for missing variables
  for (const varName of requiredVars) {
    if (!(varName in variables)) {
      missingVariables.push(varName);
    }
  }

  // If schema is provided, validate against it
  if (schema && schema.required) {
    for (const requiredVar of schema.required) {
      if (!(requiredVar in variables)) {
        if (!missingVariables.includes(requiredVar)) {
          missingVariables.push(requiredVar);
        }
      } else {
        // Type validation (basic)
        const varSchema = schema.properties?.[requiredVar];
        if (varSchema && varSchema.type) {
          const actualType = Array.isArray(variables[requiredVar])
            ? 'array'
            : typeof variables[requiredVar];
          if (actualType !== varSchema.type) {
            invalidVariables.push(
              `${requiredVar} (expected ${varSchema.type}, got ${actualType})`
            );
          }
        }
      }
    }
  }

  return {
    isValid: missingVariables.length === 0 && invalidVariables.length === 0,
    missingVariables,
    invalidVariables,
  };
}
