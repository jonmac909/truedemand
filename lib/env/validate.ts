/**
 * C4 Deployment - Environment Variable Validation
 *
 * Validates that all required environment variables are present at startup.
 * Fails fast with clear error messages if configuration is incomplete.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string | number;
}

const ENV_SCHEMA: EnvVar[] = [
  // Supabase (required for frontend and worker)
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key (public)',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (server-side only)',
  },

  // LLM API (required for validation and blueprint generation)
  {
    name: 'ANTHROPIC_API_KEY',
    required: true,
    description: 'Anthropic Claude API key',
  },

  // External data sources (required for validation signals)
  {
    name: 'APIFY_API_KEY',
    required: true,
    description: 'Apify API key for TikTok scraping',
  },

  // Worker configuration (optional - has defaults)
  {
    name: 'WORKER_POLL_INTERVAL_MS',
    required: false,
    description: 'Worker polling interval in milliseconds',
    defaultValue: 2000,
  },
  {
    name: 'WORKER_HEARTBEAT_INTERVAL_MS',
    required: false,
    description: 'Worker heartbeat interval in milliseconds',
    defaultValue: 15000,
  },
  {
    name: 'WORKER_STALE_JOB_CHECK_INTERVAL_MS',
    required: false,
    description: 'Stale job check interval in milliseconds',
    defaultValue: 60000,
  },
  {
    name: 'WORKER_STALE_JOB_THRESHOLD_SECONDS',
    required: false,
    description: 'Stale job threshold in seconds',
    defaultValue: 300,
  },
];

/**
 * Validate environment variables at startup.
 * Throws error with clear message if required variables are missing.
 */
export function validateEnvironment(context: 'frontend' | 'worker'): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_SCHEMA) {
    const value = process.env[envVar.name];

    // Skip frontend-only validation for worker-specific vars
    if (context === 'frontend' && envVar.name.startsWith('WORKER_')) {
      continue;
    }

    if (envVar.required && !value) {
      missing.push(`${envVar.name}: ${envVar.description}`);
    } else if (!envVar.required && !value && envVar.defaultValue !== undefined) {
      warnings.push(
        `${envVar.name} not set, using default: ${envVar.defaultValue}`
      );
    }
  }

  // Log warnings
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  // Fail fast on missing required variables
  if (missing.length > 0) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      '',
      ...missing.map((m) => `   - ${m}`),
      '',
      'Please copy .env.example to .env and fill in your values.',
      'See docs/DEPLOYMENT.md for detailed setup instructions.',
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Get environment variable with default fallback.
 * Use this for optional configuration values.
 */
export function getEnvOrDefault(name: string, defaultValue: string | number): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return String(defaultValue);
  }
  return value;
}

/**
 * Validate Supabase configuration specifically.
 * Checks that URLs are well-formed and keys look valid.
 */
export function validateSupabaseConfig(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check URL format
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL must start with https:// (got: ' + supabaseUrl + ')'
    );
  }

  if (supabaseUrl && !supabaseUrl.includes('.supabase.co')) {
    console.warn(
      '⚠️  NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase URL:',
      supabaseUrl
    );
  }

  // Check that keys look valid (basic sanity check)
  if (anonKey && anonKey.length < 20) {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY looks too short');
  }

  if (serviceKey && serviceKey.length < 20) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY looks too short');
  }

  // Security: Ensure service role key is not accidentally used in frontend
  if (typeof window !== 'undefined' && serviceKey) {
    console.error(
      '❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY detected in browser context! This is a security risk.'
    );
  }
}
