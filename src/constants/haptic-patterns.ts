import type { HapticImpactType } from 'react-native-custom-haptics';

import { VibrationPattern } from '@/types/settings-enums';

// ============================================================================
// Types
// ============================================================================

export type HapticPattern = HapticImpactType[];

// ============================================================================
// Pattern Definitions
// ============================================================================

/**
 * Gentle pattern - soft, widely spaced vibrations
 * Perfect for light sleepers or quiet environments
 */
export const GENTLE_PATTERN: HapticPattern = [
  'light',
  800,
  'light',
  800,
  'light',
  2000, // Long pause before repeat
];

/**
 * Moderate pattern - medium intensity, regular rhythm
 * Balanced wake-up experience
 */
export const MODERATE_PATTERN: HapticPattern = ['medium', 400, 'medium', 400, 'medium', 1500];

/**
 * Intense pattern - strong, rapid vibrations
 * For heavy sleepers who need a stronger wake-up
 */
export const INTENSE_PATTERN: HapticPattern = [
  'heavy',
  200,
  'heavy',
  200,
  'heavy',
  150,
  'heavy',
  800,
];

/**
 * Progressive pattern - starts gentle, escalates to intense
 * Gradually builds up to wake the user
 */
export const PROGRESSIVE_PATTERN: HapticPattern = [
  'light',
  600,
  'light',
  500,
  'medium',
  400,
  'medium',
  300,
  'heavy',
  200,
  'heavy',
  150,
  'heavy',
  1000,
];

// ============================================================================
// Test Patterns (Shorter versions for preview)
// ============================================================================

export const GENTLE_TEST_PATTERN: HapticPattern = ['light', 300, 'light', 300, 'light'];

export const MODERATE_TEST_PATTERN: HapticPattern = ['medium', 250, 'medium', 250, 'medium'];

export const INTENSE_TEST_PATTERN: HapticPattern = [
  'heavy',
  150,
  'heavy',
  150,
  'heavy',
  150,
  'heavy',
];

export const PROGRESSIVE_TEST_PATTERN: HapticPattern = [
  'light',
  200,
  'medium',
  200,
  'heavy',
  150,
  'heavy',
];

// ============================================================================
// Pattern Mapping
// ============================================================================

export const HAPTIC_PATTERNS: Record<VibrationPattern, HapticPattern> = {
  [VibrationPattern.GENTLE]: GENTLE_PATTERN,
  [VibrationPattern.MODERATE]: MODERATE_PATTERN,
  [VibrationPattern.INTENSE]: INTENSE_PATTERN,
  [VibrationPattern.PROGRESSIVE]: PROGRESSIVE_PATTERN,
};

export const HAPTIC_TEST_PATTERNS: Record<VibrationPattern, HapticPattern> = {
  [VibrationPattern.GENTLE]: GENTLE_TEST_PATTERN,
  [VibrationPattern.MODERATE]: MODERATE_TEST_PATTERN,
  [VibrationPattern.INTENSE]: INTENSE_TEST_PATTERN,
  [VibrationPattern.PROGRESSIVE]: PROGRESSIVE_TEST_PATTERN,
};
