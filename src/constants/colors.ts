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

  // Gray colors (matching Tailwind's gray palette)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic colors (matching Tailwind palette)
  blue: {
    300: '#93C5FD',
    500: '#3b82f6',
  },
  red: {
    500: '#ef4444',
  },
  green: {
    500: '#22c55e',
  },
  orange: {
    500: '#f97316',
  },
  indigo: {
    400: '#818cf8',
    900: '#312e81',
  },
  teal: {
    500: '#14b8a6',
  },
  purple: {
    500: '#a855f7',
  },

  // Base colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof COLORS;
