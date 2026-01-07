import type { AlarmInput } from '@/stores/use-alarms-store';
import type { Alarm } from '@/types/alarm';
import type { Period } from '@/types/alarm-enums';
import { Period as PeriodEnum } from '@/types/alarm-enums';

export interface AlarmValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates time format (HH:MM)
 */
export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validates period is a valid enum value
 */
export function validatePeriod(period: Period): boolean {
  return Object.values(PeriodEnum).includes(period);
}

/**
 * Normalizes time to 24-hour format for comparison
 */
export function normalizeTime(time: string, period: Period): number {
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;

  if (period === PeriodEnum.PM && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === PeriodEnum.AM && hours === 12) {
    hour24 = 0;
  }

  return hour24 * 60 + minutes; // Return total minutes for easy comparison
}

/**
 * Checks if alarm time already exists (considering period)
 */
export function isDuplicateTime(
  alarms: Alarm[],
  time: string,
  period: Period,
  excludeId?: string
): boolean {
  const newTimeMinutes = normalizeTime(time, period);

  return alarms.some((alarm) => {
    if (excludeId && alarm.id === excludeId) {
      return false;
    }
    const existingTimeMinutes = normalizeTime(alarm.time, alarm.period);
    return existingTimeMinutes === newTimeMinutes;
  });
}

/**
 * Validates alarm input data
 */
export function validateAlarmInput(
  input: AlarmInput,
  existingAlarms: Alarm[],
  excludeId?: string
): AlarmValidationResult {
  // Validate time format
  if (!input.time || typeof input.time !== 'string') {
    return {
      isValid: false,
      error: 'Time is required and must be a string',
    };
  }

  if (!validateTimeFormat(input.time)) {
    return {
      isValid: false,
      error: 'Invalid time format. Expected format: HH:MM (e.g., "05:30")',
    };
  }

  // Validate period
  if (!input.period) {
    return {
      isValid: false,
      error: 'Period (AM/PM) is required',
    };
  }

  if (!validatePeriod(input.period)) {
    return {
      isValid: false,
      error: 'Invalid period. Must be "AM" or "PM"',
    };
  }

  // Check for duplicate times
  if (isDuplicateTime(existingAlarms, input.time, input.period, excludeId)) {
    return {
      isValid: false,
      error: `An alarm already exists for ${input.time} ${input.period}`,
    };
  }

  // Validate challenge
  if (!input.challenge || typeof input.challenge !== 'string' || !input.challenge.trim()) {
    return {
      isValid: false,
      error: 'Challenge type is required',
    };
  }

  // Validate challenge icon
  if (
    !input.challengeIcon ||
    typeof input.challengeIcon !== 'string' ||
    !input.challengeIcon.trim()
  ) {
    return {
      isValid: false,
      error: 'Challenge icon is required',
    };
  }

  // Validate schedule
  if (!input.schedule || typeof input.schedule !== 'string' || !input.schedule.trim()) {
    return {
      isValid: false,
      error: 'Schedule is required',
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes alarm input data
 */
export function sanitizeAlarmInput(input: AlarmInput): AlarmInput {
  return {
    ...input,
    time: input.time.trim(),
    challenge: input.challenge.trim(),
    challengeIcon: input.challengeIcon.trim(),
    schedule: input.schedule.trim(),
  };
}
