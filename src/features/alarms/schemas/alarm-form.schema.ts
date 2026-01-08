import { z } from 'zod';

import { DayOfWeek } from '@/features/alarms/components/schedule-selector';
import { BackupProtocolId, ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';

/**
 * Schema for backup protocol configuration
 */
const backupProtocolSchema = z.object({
  id: z.enum([BackupProtocolId.SNOOZE, BackupProtocolId.WAKE_CHECK, BackupProtocolId.BARCODE_SCAN]),
  enabled: z.boolean(),
});

/**
 * Zod schema for the alarm form
 */
export const alarmFormSchema = z.object({
  hour: z.number().min(1).max(12),
  minute: z.number().min(0).max(59),
  period: z.enum([Period.AM, Period.PM]),
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
    .min(1, 'At least one day must be selected'),
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
 * Default form values for creating a new alarm
 */
export const DEFAULT_ALARM_FORM_VALUES: AlarmFormData = {
  hour: 6,
  minute: 0,
  period: Period.AM,
  selectedDays: [DayOfWeek.MONDAY], // Will be overridden with current day
  challenge: ChallengeType.MATH,
  difficulty: DifficultyLevel.ADAPTIVE,
  protocols: [
    { id: BackupProtocolId.SNOOZE, enabled: false },
    { id: BackupProtocolId.WAKE_CHECK, enabled: true },
    { id: BackupProtocolId.BARCODE_SCAN, enabled: false },
  ],
};
