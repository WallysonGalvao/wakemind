/**
 * @file Time Utilities
 * @description Helper functions for time formatting and parsing
 * @module features/alarms/utils
 */

import { Period } from '@/types/alarm-enums';

/**
 * Result of time parsing operation
 */
export interface ParsedTime {
  hour: number;
  minute: number;
}

/**
 * Formats time in 24-hour format (HH:MM)
 * @param hour - Hour value (0-23)
 * @param minute - Minute value (0-59)
 * @returns Formatted time string in 24h format
 * @example
 * formatTime24h(9, 30) // "09:30"
 * formatTime24h(14, 5) // "14:05"
 */
export const formatTime24h = (hour: number, minute: number): string => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

/**
 * Formats time in 12-hour format with period (HH:MM AM/PM)
 * @param hour - Hour value (0-23)
 * @param minute - Minute value (0-59)
 * @returns Formatted time string in 12h format with period
 * @example
 * formatTime12h(9, 30) // "09:30 AM"
 * formatTime12h(14, 5) // "02:05 PM"
 * formatTime12h(0, 0) // "12:00 AM"
 */
export const formatTime12h = (hour: number, minute: number): string => {
  const period = hour < 12 ? Period.AM : Period.PM;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};

/**
 * Determines the period (AM/PM) for a given hour
 * @param hour - Hour value (0-23)
 * @returns Period.AM or Period.PM
 * @example
 * getPeriodFromHour(9) // Period.AM
 * getPeriodFromHour(14) // Period.PM
 */
export const getPeriodFromHour = (hour: number): Period => {
  return hour < 12 ? Period.AM : Period.PM;
};

/**
 * Validates time values
 * @param hour - Hour value to validate
 * @param minute - Minute value to validate
 * @returns True if both values are valid
 * @example
 * isValidTime(10, 30) // true
 * isValidTime(24, 0) // false
 * isValidTime(10, 60) // false
 */
export const isValidTime = (hour: number, minute: number): boolean => {
  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  );
};

/**
 * Parses a time string in 24h format (HH:MM) to hour and minute values
 * @param timeString - Time string to parse (e.g., "09:30", "14:05")
 * @returns Parsed time object or null if invalid
 * @example
 * parseTimeString("09:30") // { hour: 9, minute: 30 }
 * parseTimeString("14:05") // { hour: 14, minute: 5 }
 * parseTimeString("invalid") // null
 */
export const parseTimeString = (timeString: string): ParsedTime | null => {
  const parts = timeString.split(':');
  if (parts.length !== 2) {
    return null;
  }

  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  if (!isValidTime(hour, minute)) {
    return null;
  }

  return { hour, minute };
};

/**
 * Converts 12-hour format to 24-hour format
 * @param hour12 - Hour in 12-hour format (1-12)
 * @param period - AM or PM
 * @returns Hour in 24-hour format (0-23)
 * @example
 * convert12to24(9, Period.AM) // 9
 * convert12to24(2, Period.PM) // 14
 * convert12to24(12, Period.AM) // 0
 * convert12to24(12, Period.PM) // 12
 */
export const convert12to24 = (hour12: number, period: Period): number => {
  if (period === Period.AM) {
    return hour12 === 12 ? 0 : hour12;
  } else {
    return hour12 === 12 ? 12 : hour12 + 12;
  }
};

/**
 * Converts 24-hour format to 12-hour format
 * @param hour24 - Hour in 24-hour format (0-23)
 * @returns Object with hour in 12-hour format and period
 * @example
 * convert24to12(9) // { hour: 9, period: Period.AM }
 * convert24to12(14) // { hour: 2, period: Period.PM }
 * convert24to12(0) // { hour: 12, period: Period.AM }
 */
export const convert24to12 = (hour24: number): { hour: number; period: Period } => {
  const period = hour24 < 12 ? Period.AM : Period.PM;
  const hour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  return { hour, period };
};
