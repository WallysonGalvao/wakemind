import dayjs from 'dayjs';
import { and, eq, sql } from 'drizzle-orm';

import { Platform } from 'react-native';

import { db } from '@/db';
import { alarms } from '@/db/schema';
import type { BackupProtocol } from '@/features/alarms/components/backup-protocols-section';
import { AlarmScheduler } from '@/services/alarm-scheduler';
import type { ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';

/**
 * Alarm database operations with integrated scheduling
 */

const isNativePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

export interface AlarmRecord {
  id: string;
  time: string;
  period: Period;
  challenge: string;
  challengeType: ChallengeType;
  challengeIcon: string;
  schedule: string;
  isEnabled: boolean;
  difficulty?: DifficultyLevel;
  protocols?: BackupProtocol[];
}

export interface AlarmInput {
  time: string;
  period: Period;
  challenge: string;
  challengeType: ChallengeType;
  challengeIcon: string;
  schedule: string;
  difficulty?: DifficultyLevel;
  protocols?: BackupProtocol[];
}

/**
 * Get all alarms ordered by time
 */
export async function getAlarms(): Promise<AlarmRecord[]> {
  const results = await db.select().from(alarms).orderBy(alarms.time, alarms.period);

  return results.map((alarm) => ({
    id: alarm.id,
    time: alarm.time,
    period: alarm.period as Period,
    challenge: alarm.challenge,
    challengeType: alarm.challengeType as ChallengeType,
    challengeIcon: alarm.challengeIcon,
    schedule: alarm.schedule,
    isEnabled: alarm.isEnabled,
    difficulty: alarm.difficulty as DifficultyLevel | undefined,
    protocols: alarm.protocols ? JSON.parse(alarm.protocols) : undefined,
  }));
}

/**
 * Get alarm by ID
 */
export async function getAlarmById(id: string): Promise<AlarmRecord | null> {
  const results = await db.select().from(alarms).where(eq(alarms.id, id)).limit(1);

  if (results.length === 0) return null;

  const alarm = results[0];
  return {
    id: alarm.id,
    time: alarm.time,
    period: alarm.period as Period,
    challenge: alarm.challenge,
    challengeType: alarm.challengeType as ChallengeType,
    challengeIcon: alarm.challengeIcon,
    schedule: alarm.schedule,
    isEnabled: alarm.isEnabled,
    difficulty: alarm.difficulty as DifficultyLevel | undefined,
    protocols: alarm.protocols ? JSON.parse(alarm.protocols) : undefined,
  };
}

/**
 * Add a new alarm
 */
export async function addAlarm(id: string, input: AlarmInput): Promise<void> {
  const now = dayjs().toISOString();

  // Insert into database first
  await db.insert(alarms).values({
    id,
    time: input.time,
    period: input.period,
    challenge: input.challenge,
    challengeType: input.challengeType,
    challengeIcon: input.challengeIcon,
    schedule: input.schedule,
    isEnabled: true,
    difficulty: input.difficulty,
    protocols: input.protocols ? JSON.stringify(input.protocols) : null,
    createdAt: now,
    updatedAt: now,
  });

  // Schedule notification on native platforms
  if (isNativePlatform) {
    try {
      await AlarmScheduler.scheduleAlarm({
        id,
        ...input,
        isEnabled: true,
      });
    } catch (error) {
      console.error('[Alarms DB] Failed to schedule alarm:', error);
      // Rollback: delete from database if scheduling failed
      await db.delete(alarms).where(eq(alarms.id, id));
      throw error;
    }
  }
}

/**
 * Update an existing alarm
 */
export async function updateAlarm(
  id: string,
  updates: Partial<AlarmInput & { isEnabled: boolean }>
): Promise<void> {
  const now = dayjs().toISOString();

  const updateData: Record<string, unknown> = {
    updatedAt: now,
  };

  if (updates.time !== undefined) updateData.time = updates.time;
  if (updates.period !== undefined) updateData.period = updates.period;
  if (updates.challenge !== undefined) updateData.challenge = updates.challenge;
  if (updates.challengeType !== undefined) updateData.challengeType = updates.challengeType;
  if (updates.challengeIcon !== undefined) updateData.challengeIcon = updates.challengeIcon;
  if (updates.schedule !== undefined) updateData.schedule = updates.schedule;
  if (updates.isEnabled !== undefined) updateData.isEnabled = updates.isEnabled;
  if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
  if (updates.protocols !== undefined)
    updateData.protocols = updates.protocols ? JSON.stringify(updates.protocols) : null;

  // Update database
  await db.update(alarms).set(updateData).where(eq(alarms.id, id));

  // Reschedule if needed (on native platforms and alarm is enabled)
  if (isNativePlatform) {
    const alarm = await getAlarmById(id);
    if (!alarm) return;

    const needsReschedule =
      updates.time !== undefined || updates.period !== undefined || updates.schedule !== undefined;

    if (alarm.isEnabled && needsReschedule) {
      try {
        await AlarmScheduler.rescheduleAlarm(alarm);
      } catch (error) {
        console.error('[Alarms DB] Failed to reschedule alarm:', error);
        throw error;
      }
    }
  }
}

/**
 * Delete an alarm (cascades to completions with SET NULL)
 */
export async function deleteAlarm(id: string): Promise<void> {
  // Cancel notification on native platforms
  if (isNativePlatform) {
    try {
      await AlarmScheduler.cancelAlarm(id);
    } catch (error) {
      console.error('[Alarms DB] Failed to cancel alarm:', error);
    }
  }

  // Delete from database
  await db.delete(alarms).where(eq(alarms.id, id));
}

/**
 * Toggle alarm enabled state
 */
export async function toggleAlarm(id: string): Promise<boolean> {
  const alarm = await getAlarmById(id);
  if (!alarm) throw new Error('Alarm not found');

  const newState = !alarm.isEnabled;

  // Schedule or cancel based on new state (on native platforms)
  if (isNativePlatform) {
    try {
      if (newState) {
        await AlarmScheduler.scheduleAlarm({ ...alarm, isEnabled: true });
      } else {
        await AlarmScheduler.cancelAlarm(id);
      }
    } catch (error) {
      console.error('[Alarms DB] Failed to toggle alarm schedule:', error);
      throw error;
    }
  }

  // Update database
  await updateAlarm(id, { isEnabled: newState });

  return newState;
}

/**
 * Check if alarm with same time and period already exists
 */
export async function alarmExists(
  time: string,
  period: Period,
  excludeId?: string
): Promise<boolean> {
  const query = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(alarms)
    .where(and(eq(alarms.time, time), eq(alarms.period, period)));

  const results = await query;
  let count = results[0]?.count || 0;

  // If we're updating an alarm, exclude it from the count
  if (excludeId && count > 0) {
    const existingAlarm = await db
      .select()
      .from(alarms)
      .where(and(eq(alarms.time, time), eq(alarms.period, period)))
      .limit(1);

    if (existingAlarm.length > 0 && existingAlarm[0].id === excludeId) {
      count--;
    }
  }

  return count > 0;
}

/**
 * Get all enabled alarms
 */
export async function getEnabledAlarms(): Promise<AlarmRecord[]> {
  const results = await db
    .select()
    .from(alarms)
    .where(eq(alarms.isEnabled, true))
    .orderBy(alarms.time, alarms.period);

  return results.map((alarm) => ({
    id: alarm.id,
    time: alarm.time,
    period: alarm.period as Period,
    challenge: alarm.challenge,
    challengeType: alarm.challengeType as ChallengeType,
    challengeIcon: alarm.challengeIcon,
    schedule: alarm.schedule,
    isEnabled: alarm.isEnabled,
    difficulty: alarm.difficulty as DifficultyLevel | undefined,
    protocols: alarm.protocols ? JSON.parse(alarm.protocols) : undefined,
  }));
}

/**
 * Delete all alarms (for testing/reset)
 */
export async function deleteAllAlarms(): Promise<void> {
  await db.delete(alarms);
}

/**
 * Sync all enabled alarms with the scheduler
 * Cancels all scheduled alarms and reschedules enabled ones
 */
export async function syncAlarmsWithScheduler(): Promise<void> {
  if (!isNativePlatform) return;

  const enabledAlarms = await getEnabledAlarms();

  // Cancel all existing scheduled alarms
  await AlarmScheduler.cancelAllAlarms();

  // Reschedule all enabled alarms in parallel
  const schedulePromises = enabledAlarms.map((alarm) =>
    AlarmScheduler.scheduleAlarm(alarm).catch((error) => {
      console.error(`[Alarms DB] Failed to sync alarm ${alarm.id}:`, error);
      return null;
    })
  );

  await Promise.allSettled(schedulePromises);
  console.log('[Alarms DB] All alarms synced with scheduler');
}
