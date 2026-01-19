import dayjs from 'dayjs';

import { alarmTimeToMinutes } from './alarm-sorting';

import type { Alarm } from '@/types/alarm';
import { Schedule } from '@/types/alarm-enums';

/**
 * Days of the week mapping for schedule parsing
 */
const DAY_MAPPINGS: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/**
 * Parse schedule string to array of day numbers (0 = Sunday, 6 = Saturday)
 */
export function parseScheduleToDays(schedule: string): number[] {
  const normalizedSchedule = schedule.toLowerCase().trim();

  switch (normalizedSchedule) {
    case Schedule.DAILY.toLowerCase():
      return [0, 1, 2, 3, 4, 5, 6];

    case Schedule.WEEKDAYS.toLowerCase():
      return [1, 2, 3, 4, 5];

    case Schedule.WEEKENDS.toLowerCase():
      return [0, 6];

    case Schedule.ONCE.toLowerCase():
      return [];

    default:
      // Parse custom schedule like "Mon, Wed, Fri"
      const days: number[] = [];
      const parts = normalizedSchedule.split(',').map((p) => p.trim());

      for (const part of parts) {
        const dayNum = DAY_MAPPINGS[part];
        if (dayNum !== undefined) {
          days.push(dayNum);
        } else {
          console.warn(
            `[AlarmTimeCalculator] Unknown day abbreviation: ${part} in schedule: ${schedule}`
          );
        }
      }

      if (days.length === 0) {
        console.error(`[AlarmTimeCalculator] Invalid schedule format: ${schedule}`);
        throw new Error(
          `Invalid alarm schedule: ${schedule}. Expected format: "Mon", "Mon, Wed, Fri", "Daily", "Weekdays", or "Weekends"`
        );
      }

      return days;
  }
}

/**
 * Parse time string (already in 24-hour format: HH:MM)
 * Period is stored for display purposes only
 */
export function convertTo24Hour(time: string): { hour: number; minute: number } {
  const parts = time.split(':');

  if (parts.length !== 2) {
    throw new Error(`Invalid time format: ${time}. Expected format: HH:MM`);
  }

  const [hourStr, minuteStr] = parts;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Invalid time values: ${time}. Hour must be 0-23, minute must be 0-59`);
  }

  // Time is already in 24-hour format (0-23), period is just for display
  return { hour, minute };
}

/**
 * Calculate the next trigger date for an alarm
 * Returns the next occurrence based on current time and schedule
 */
export function getNextTriggerDate(alarm: Alarm): Date {
  const now = dayjs();
  const { hour, minute } = convertTo24Hour(alarm.time);
  const alarmMinutesInDay = alarmTimeToMinutes(alarm.time);
  const currentMinutesInDay = now.hour() * 60 + now.minute();

  // For "Once" schedule, return today if time hasn't passed, otherwise tomorrow
  if (alarm.schedule.toLowerCase() === Schedule.ONCE.toLowerCase()) {
    if (currentMinutesInDay < alarmMinutesInDay) {
      return now.hour(hour).minute(minute).second(0).millisecond(0).toDate();
    }
    return now.add(1, 'day').hour(hour).minute(minute).second(0).millisecond(0).toDate();
  }

  const scheduledDays = parseScheduleToDays(alarm.schedule);
  const currentDay = now.day();

  // Check if alarm can trigger today
  if (scheduledDays.includes(currentDay) && currentMinutesInDay < alarmMinutesInDay) {
    return now.hour(hour).minute(minute).second(0).millisecond(0).toDate();
  }

  // Find the next scheduled day
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const futureDay = (currentDay + daysAhead) % 7;
    if (scheduledDays.includes(futureDay)) {
      return now.add(daysAhead, 'day').hour(hour).minute(minute).second(0).millisecond(0).toDate();
    }
  }

  // Fallback: tomorrow at the specified time
  return now.add(1, 'day').hour(hour).minute(minute).second(0).millisecond(0).toDate();
}

/**
 * Calculate timestamp for trigger notification
 * Returns Unix timestamp in milliseconds
 */
export function getNextTriggerTimestamp(alarm: Alarm): number {
  return getNextTriggerDate(alarm).getTime();
}

/**
 * Check if an alarm should repeat based on its schedule
 */
export function isRepeatingAlarm(alarm: Alarm): boolean {
  return alarm.schedule.toLowerCase() !== Schedule.ONCE.toLowerCase();
}

/**
 * Get human-readable time until alarm triggers
 */
export function getTimeUntilAlarm(alarm: Alarm): string {
  const now = dayjs();
  const triggerDate = dayjs(getNextTriggerDate(alarm));
  const diffMinutes = triggerDate.diff(now, 'minute');

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffHours < 24) {
    if (remainingMinutes === 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    return `${diffHours}h ${remainingMinutes}m`;
  }

  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (remainingHours === 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }
  return `${diffDays}d ${remainingHours}h`;
}
