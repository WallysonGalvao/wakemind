/**
 * Reset Database Functions
 * Functions to clear all user data (not including RevenueCat subscription data)
 */

import { db } from '@/db';
import {
  alarmCompletions,
  alarms,
  goals,
  routineCompletions,
  routineItems,
  snoozeLogs,
  streakFreezes,
  userAchievements,
} from '@/db/schema';

/**
 * Deletes ALL user data from the database
 * This includes:
 * - Alarms and alarm completions
 * - Achievements progress
 * - Goals
 * - Morning routine items and completions
 * - Snooze logs
 * - Streak freeze tokens
 *
 * Note: Does NOT affect RevenueCat subscription data
 */
export async function deleteAllUserData(): Promise<void> {
  try {
    // Delete in order to avoid foreign key issues
    await db.delete(alarmCompletions);
    await db.delete(alarms);
    await db.delete(userAchievements);
    await db.delete(goals);
    await db.delete(routineCompletions);
    await db.delete(routineItems);
    await db.delete(snoozeLogs);
    await db.delete(streakFreezes);

    console.log('[deleteAllUserData] All user data has been deleted');
  } catch (error) {
    console.error('[deleteAllUserData] Error deleting user data:', error);
    throw error;
  }
}
