/**
 * TrueDemand Design System Tokens
 *
 * Centralized design tokens for the approved blue theme.
 * All UI components MUST consume these tokens - no hardcoded values.
 */

export const designTokens = {
  // === COLOR PALETTE ===
  colors: {
    // Primary brand (trustworthy blue)
    primary: {
      DEFAULT: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
      softest: '#EFF6FF',
      soft: '#F0F9FF',
    },

    // Neutrals (slate scale)
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E5E7EB',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },

    // Semantic colors
    success: {
      DEFAULT: '#10B981',
      light: '#34D399',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    },

    warning: {
      DEFAULT: '#F59E0B',
      light: '#FBBF24',
      bg: '#FEF3C7',
      border: '#FCD34D',
    },

    error: {
      DEFAULT: '#EF4444',
      light: '#F87171',
      bg: '#FEE2E2',
      border: '#FCA5A5',
    },

    // Completed state (emerald)
    completed: {
      DEFAULT: '#10B981',
      bg: '#ECFDF5',
      border: '#86EFAC',
    },
  },

  // === SPACING SCALE ===
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem',   // 48px
    '4xl': '4rem',   // 64px
    '5xl': '5rem',   // 80px
  },

  // === BORDER RADIUS ===
  radius: {
    sm: '0.5rem',      // 8px - small elements
    DEFAULT: '0.625rem', // 10px - buttons, inputs
    md: '0.75rem',     // 12px - medium cards
    lg: '0.875rem',    // 14px - large cards
    xl: '1rem',        // 16px - hero elements
    '2xl': '1.25rem',  // 20px - extra large
    full: '9999px',    // pills, avatar
  },

  // === SHADOWS ===
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
    md: '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',

    // Primary shadows (blue glow)
    primarySm: '0 4px 12px rgba(37, 99, 235, 0.15)',
    primary: '0 10px 20px rgba(37, 99, 235, 0.2)',
    primaryLg: '0 20px 40px rgba(37, 99, 235, 0.25)',

    // Hover shadows
    hoverCard: '0 10px 30px rgba(37, 99, 235, 0.08)',
  },

  // === TYPOGRAPHY ===
  typography: {
    // Font families
    fonts: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"Geist Mono", "SF Mono", Monaco, monospace',
    },

    // Font sizes (exact approved values)
    sizes: {
      xs: '0.75rem',   // 12px - labels, helper text
      sm: '0.875rem',  // 14px - body small, UI text
      base: '0.9375rem', // 15px - body text
      md: '1rem',      // 16px - inputs
      lg: '1.125rem',  // 18px - card titles
      xl: '1.25rem',   // 20px - section headers
      '2xl': '1.375rem', // 22px - emoji size
      '3xl': '2rem',   // 32px - page headers
    },

    // Font weights
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    // Line heights
    leading: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    },

    // Letter spacing
    tracking: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.06em',  // Used in stepper labels
    },
  },

  // === TRANSITIONS ===
  transitions: {
    fast: '100ms',
    DEFAULT: '200ms',
    slow: '300ms',

    // Easing functions
    easing: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // === COMPONENT-SPECIFIC TOKENS ===
  components: {
    button: {
      height: {
        sm: '2.5rem',   // 40px
        DEFAULT: '2.75rem', // 44px
        lg: '3rem',     // 48px
      },
      paddingX: {
        sm: '1rem',     // 16px
        DEFAULT: '1.5rem', // 24px
        lg: '2rem',     // 32px
      },
    },

    card: {
      padding: {
        sm: '1rem',     // 16px
        DEFAULT: '1.5rem', // 24px
        lg: '3rem',     // 48px
      },
    },

    stepper: {
      circleSize: '3.5rem', // 56px (14 * 4)
      emojiSize: '1.375rem', // 22px
      labelSize: '0.75rem',  // 12px
      lineHeight: '0.1875rem', // 3px
    },
  },
} as const;

// === UTILITY FUNCTIONS ===

/**
 * Get primary gradient for buttons and active states
 */
export const getPrimaryGradient = () =>
  `linear-gradient(135deg, ${designTokens.colors.primary.DEFAULT} 0%, ${designTokens.colors.primary.light} 100%)`;

/**
 * Get hover gradient (darker)
 */
export const getHoverGradient = () =>
  `linear-gradient(135deg, ${designTokens.colors.primary.dark} 0%, ${designTokens.colors.primary.DEFAULT} 100%)`;

/**
 * Build transition string
 */
export const buildTransition = (
  properties: string[],
  duration: keyof typeof designTokens.transitions = 'DEFAULT'
) => {
  const time = designTokens.transitions[duration];
  const easing = designTokens.transitions.easing.DEFAULT;
  return properties.map((prop) => `${prop} ${time} ${easing}`).join(', ');
};
