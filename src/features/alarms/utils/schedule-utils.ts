/**
 * @file Schedule Utilities
 * @description Helper functions for managing alarm schedules
 * @module features/alarms/utils
 */

import dayjs from 'dayjs';

import {
  ABBREVIATION_TO_DAY,
  DAY_ABBREVIATIONS,
  DAY_GROUPS,
  SCHEDULE_PRESET,
} from '../constants/alarm-constants';
import { DayOfWeek } from '../types';

/**
 * Gets the current day of the week as DayOfWeek enum
 * @returns Current day of week
 * @example
 * const today = getCurrentDayOfWeek(); // DayOfWeek.MONDAY
 */
export const getCurrentDayOfWeek = (): DayOfWeek => {
  const dayIndex = dayjs().day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  return dayMap[dayIndex];
};

/**
 * Generates a human-readable schedule label from selected days
 * @param days - Array of selected days of the week
 * @returns Formatted schedule label (e.g., "Daily", "Weekdays", "Mon, Wed, Fri")
 * @example
 * getScheduleLabel([DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY]) // "Mon, Wed"
 * getScheduleLabel(DAY_GROUPS.WEEKDAYS) // "Weekdays"
 */
export const getScheduleLabel = (days: DayOfWeek[]): string => {
  // Check if all days selected
  if (days.length === 7) {
    return SCHEDULE_PRESET.DAILY;
  }

  // Check if weekdays only
  if (
    days.length === 5 &&
    DAY_GROUPS.WEEKDAYS.every((d) => days.includes(d)) &&
    !DAY_GROUPS.WEEKENDS.some((d) => days.includes(d))
  ) {
    return SCHEDULE_PRESET.WEEKDAYS;
  }

  // Check if weekends only
  if (
    days.length === 2 &&
    DAY_GROUPS.WEEKENDS.every((d) => days.includes(d)) &&
    !DAY_GROUPS.WEEKDAYS.some((d) => days.includes(d))
  ) {
    return SCHEDULE_PRESET.WEEKENDS;
  }

  // Single day
  if (days.length === 1) {
    return DAY_ABBREVIATIONS[days[0]];
  }

  // Custom: list of day abbreviations
  const sortedDays = [...days].sort((a, b) => {
    const order = DAY_GROUPS.ALL;
    return order.indexOf(a) - order.indexOf(b);
  });
  return sortedDays.map((d) => DAY_ABBREVIATIONS[d]).join(', ');
};

/**
 * Parses a schedule label string back into an array of DayOfWeek values
 * @param schedule - Schedule label string (e.g., "Daily", "Weekdays", "Mon, Wed")
 * @returns Array of DayOfWeek values, falls back to current day if parsing fails
 * @example
 * parseScheduleToDays("Weekdays") // [DayOfWeek.MONDAY, ...]
 * parseScheduleToDays("Mon, Fri") // [DayOfWeek.MONDAY, DayOfWeek.FRIDAY]
 */
export const parseScheduleToDays = (schedule: string): DayOfWeek[] => {
  // Handle preset values
  if (schedule === SCHEDULE_PRESET.DAILY) {
    return [...DAY_GROUPS.ALL];
  }
  if (schedule === SCHEDULE_PRESET.WEEKDAYS) {
    return [...DAY_GROUPS.WEEKDAYS];
  }
  if (schedule === SCHEDULE_PRESET.WEEKENDS) {
    return [...DAY_GROUPS.WEEKENDS];
  }

  // Handle single day abbreviation
  if (ABBREVIATION_TO_DAY[schedule]) {
    return [ABBREVIATION_TO_DAY[schedule]];
  }

  // Handle custom: comma-separated day abbreviations
  const abbreviations = schedule.split(',').map((s) => s.trim());
  const days: DayOfWeek[] = [];
  for (const abbr of abbreviations) {
    if (ABBREVIATION_TO_DAY[abbr]) {
      days.push(ABBREVIATION_TO_DAY[abbr]);
    }
  }

  // If parsing failed, return current day as fallback
  return days.length > 0 ? days : [getCurrentDayOfWeek()];
};

/**
 * Checks if a schedule represents all days of the week
 * @param days - Array of days to check
 * @returns True if schedule includes all 7 days
 */
export const isFullWeekSchedule = (days: DayOfWeek[]): boolean => {
  return days.length === 7;
};

/**
 * Checks if a schedule represents only weekdays
 * @param days - Array of days to check
 * @returns True if schedule includes only Monday-Friday
 */
export const isWeekdaysSchedule = (days: DayOfWeek[]): boolean => {
  return (
    days.length === 5 &&
    DAY_GROUPS.WEEKDAYS.every((d) => days.includes(d)) &&
    !DAY_GROUPS.WEEKENDS.some((d) => days.includes(d))
  );
};

/**
 * Checks if a schedule represents only weekends
 * @param days - Array of days to check
 * @returns True if schedule includes only Saturday-Sunday
 */
export const isWeekendsSchedule = (days: DayOfWeek[]): boolean => {
  return (
    days.length === 2 &&
    DAY_GROUPS.WEEKENDS.every((d) => days.includes(d)) &&
    !DAY_GROUPS.WEEKDAYS.some((d) => days.includes(d))
  );
};
