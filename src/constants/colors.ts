/**
 * Color constants to avoid hardcoded color literals
 * These colors should match the theme defined in tailwind.config.js
 */

export const COLORS = {
  // Brand colors
  brandPrimary: '#135bec',

  // Slate colors (matching Tailwind's slate palette)
  slate: {
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
  },

  // Base colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof COLORS;
