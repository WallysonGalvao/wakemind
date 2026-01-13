import { z } from 'zod';

import { DayOfWeek } from '@/features/alarms/components/schedule-selector';
import { BackupProtocolId, ChallengeType, DifficultyLevel } from '@/types/alarm-enums';

/**
 * Schema for backup protocol configuration
 */
const backupProtocolSchema = z.object({
  id: z.enum([BackupProtocolId.SNOOZE, BackupProtocolId.WAKE_CHECK, BackupProtocolId.BARCODE_SCAN]),
  enabled: z.boolean(),
});

/**
 * Zod schema for the alarm form
 * Uses 24-hour format for hour (0-23)
 */
export const alarmFormSchema = z.object({
  hour: z.number().min(0).max(23), // 24-hour format
  minute: z.number().min(0).max(59),
  selectedDays: z
    .array(
      z.enum([
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
        DayOfWeek.SUNDAY,
      ])
    )
    .min(1, 'validation.atLeastOneDayRequired'),
  challenge: z.enum([ChallengeType.MATH, ChallengeType.MEMORY, ChallengeType.LOGIC]),
  difficulty: z.enum([
    DifficultyLevel.EASY,
    DifficultyLevel.MEDIUM,
    DifficultyLevel.HARD,
    DifficultyLevel.ADAPTIVE,
  ]),
  protocols: z.array(backupProtocolSchema),
});

/**
 * TypeScript type inferred from the schema
 */
export type AlarmFormData = z.infer<typeof alarmFormSchema>;

/**
 * Get default alarm form values with dynamic time (current time + 1 hour)
 */
export function getDefaultAlarmFormValues(): AlarmFormData {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  const currentMinute = now.getMinutes();

  return {
    hour: nextHour,
    minute: currentMinute,
    selectedDays: [], // Will be overridden with current day in form
    challenge: ChallengeType.MATH,
    difficulty: DifficultyLevel.EASY,
    protocols: [
      { id: BackupProtocolId.SNOOZE, enabled: false },
      { id: BackupProtocolId.WAKE_CHECK, enabled: true },
      { id: BackupProtocolId.BARCODE_SCAN, enabled: false },
    ],
  };
}

/**
 * @deprecated Use getDefaultAlarmFormValues() instead for dynamic time
 */
export const DEFAULT_ALARM_FORM_VALUES: AlarmFormData = {
  hour: 7, // Fallback static value
  minute: 0,
  selectedDays: [],
  challenge: ChallengeType.MATH,
  difficulty: DifficultyLevel.EASY,
  protocols: [
    { id: BackupProtocolId.SNOOZE, enabled: false },
    { id: BackupProtocolId.WAKE_CHECK, enabled: true },
    { id: BackupProtocolId.BARCODE_SCAN, enabled: false },
  ],
};
