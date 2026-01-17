import type { Alarm } from '@/types/alarm';

/**
 * Converts alarm time string (HH:MM in 24-hour format) to minutes from midnight
 * This allows proper sorting of alarms by time
 * Period parameter is kept for backward compatibility but is not used since time is already in 24h format
 *
 * Examples:
 * - 00:00 = 0 minutes (midnight)
 * - 00:30 = 30 minutes
 * - 01:00 = 60 minutes
 * - 11:59 = 719 minutes
 * - 12:00 = 720 minutes (noon)
 * - 12:30 = 750 minutes
 * - 13:00 = 780 minutes
 * - 23:59 = 1439 minutes
 */
export function alarmTimeToMinutes(time: string): number {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Time is already in 24-hour format (0-23), period is just for display
  return hour * 60 + minute;
}

/**
 * Sorts alarms by time (AM first, then PM)
 * Within each period, sorts by hour and minute ascending
 *
 * @param alarms - Array of alarms to sort
 * @returns New sorted array of alarms
 */
export function sortAlarmsByTime(alarms: Alarm[]): Alarm[] {
  return [...alarms].sort((a, b) => {
    const aMinutes = alarmTimeToMinutes(a.time, a.period);
    const bMinutes = alarmTimeToMinutes(b.time, b.period);
    return aMinutes - bMinutes;
  });
}
