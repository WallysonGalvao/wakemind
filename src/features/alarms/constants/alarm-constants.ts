/**
 * @file Alarm Constants
 * @description Centralized constants for alarm feature
 * @module features/alarms/constants
 */

import { DayOfWeek } from '../types';

import type { ChallengeType } from '@/types/alarm-enums';

/**
 * Challenge type to Material Symbol icon mapping
 */
export const CHALLENGE_ICONS: Record<ChallengeType, string> = {
  math: 'calculate',
  memory: 'psychology',
  logic: 'lightbulb',
} as const;

/**
 * Day of week abbreviations for schedule labels
 */
export const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Mon',
  [DayOfWeek.TUESDAY]: 'Tue',
  [DayOfWeek.WEDNESDAY]: 'Wed',
  [DayOfWeek.THURSDAY]: 'Thu',
  [DayOfWeek.FRIDAY]: 'Fri',
  [DayOfWeek.SATURDAY]: 'Sat',
  [DayOfWeek.SUNDAY]: 'Sun',
} as const;

/**
 * Reverse mapping: abbreviation to DayOfWeek
 */
export const ABBREVIATION_TO_DAY: Record<string, DayOfWeek> = {
  Mon: DayOfWeek.MONDAY,
  Tue: DayOfWeek.TUESDAY,
  Wed: DayOfWeek.WEDNESDAY,
  Thu: DayOfWeek.THURSDAY,
  Fri: DayOfWeek.FRIDAY,
  Sat: DayOfWeek.SATURDAY,
  Sun: DayOfWeek.SUNDAY,
} as const;

/**
 * Schedule preset labels
 */
export const SCHEDULE_PRESET = {
  DAILY: 'Daily',
  WEEKDAYS: 'Weekdays',
  WEEKENDS: 'Weekends',
} as const;

export type SchedulePresetType = (typeof SCHEDULE_PRESET)[keyof typeof SCHEDULE_PRESET];

/**
 * Predefined day groups for schedule presets
 */
export const DAY_GROUPS = {
  ALL: Object.values(DayOfWeek),
  WEEKDAYS: [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ],
  WEEKENDS: [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
} as const;

/**
 * Brand primary shadow color (used for CTAs)
 */
export const BRAND_PRIMARY_SHADOW = 'rgba(19, 91, 236, 0.3)';
