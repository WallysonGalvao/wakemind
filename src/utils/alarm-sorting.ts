import type { Alarm } from '@/types/alarm';
import { Period } from '@/types/alarm-enums';

/**
 * Converts alarm time string (HH:MM) and period to minutes from midnight
 * This allows proper sorting of alarms by time
 *
 * Examples:
 * - 12:00 AM = 0 minutes (midnight)
 * - 12:30 AM = 30 minutes
 * - 01:00 AM = 60 minutes
 * - 11:59 AM = 719 minutes
 * - 12:00 PM = 720 minutes (noon)
 * - 12:30 PM = 750 minutes
 * - 01:00 PM = 780 minutes
 * - 11:59 PM = 1439 minutes
 */
export function alarmTimeToMinutes(time: string, period: Period): number {
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Handle 12-hour format conversion to 24-hour
  if (period === Period.AM) {
    // 12:00 AM - 12:59 AM is actually hour 0
    if (hour === 12) {
      hour = 0;
    }
  } else {
    // PM
    // 12:00 PM - 12:59 PM stays as hour 12
    // 1:00 PM - 11:59 PM becomes 13:00 - 23:59
    if (hour !== 12) {
      hour += 12;
    }
  }

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
