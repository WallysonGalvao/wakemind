/**
 * Achievement Condition Functions
 * Reusable functions to check if achievement conditions are met
 */

import dayjs from 'dayjs';

import { db } from '@/db';
import * as performanceService from '@/db/functions/performance';
import { alarmCompletions } from '@/db/schema';

/**
 * Check if total alarms completed meets target
 */
export async function checkTotalAlarms(target: number): Promise<boolean> {
  const total = await performanceService.getTotalAlarmsCompleted();
  return total >= target;
}

/**
 * Get current progress for total alarms
 */
export async function getTotalAlarmsProgress(target: number): Promise<number> {
  const total = await performanceService.getTotalAlarmsCompleted();
  return Math.min(total, target);
}

/**
 * Check if current streak meets target
 */
export async function checkCurrentStreak(target: number): Promise<boolean> {
  const streak = await performanceService.getCurrentStreak();
  return streak >= target;
}

/**
 * Get current streak progress
 */
export async function getCurrentStreakProgress(target: number): Promise<number> {
  const streak = await performanceService.getCurrentStreak();
  return Math.min(streak, target);
}

/**
 * Check if longest streak meets target
 */
export async function checkLongestStreak(target: number): Promise<boolean> {
  const longest = await performanceService.getLongestStreak();
  return longest >= target;
}

/**
 * Check if user has achieved a perfect score (100/100)
 */
export async function checkPerfectScore(): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  return completions.some((c) => c.cognitiveScore === 100);
}

/**
 * Check if average cognitive score meets target
 */
export async function checkAverageScore(target: number): Promise<boolean> {
  const avg = await performanceService.getAverageCognitiveScore();
  return avg >= target;
}

/**
 * Check if user has a reaction time under maxMs
 */
export async function checkReactionTime(maxMs: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  return completions.some((c) => c.reactionTime < maxMs);
}

/**
 * Check if user has completed all 3 challenge types
 */
export async function checkAllChallengeTypes(): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  const types = new Set(completions.map((c) => c.challengeType));
  return types.has('math') && types.has('memory') && types.has('logic');
}

/**
 * Check if user has completed all difficulty levels
 */
export async function checkAllDifficulties(): Promise<boolean> {
  const { alarms } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');

  const completions = await db
    .select({ difficulty: alarms.difficulty })
    .from(alarmCompletions)
    .innerJoin(alarms, eq(alarmCompletions.alarmId, alarms.id))
    .where(eq(alarms.difficulty, 'easy'))
    .union(
      db
        .select({ difficulty: alarms.difficulty })
        .from(alarmCompletions)
        .innerJoin(alarms, eq(alarmCompletions.alarmId, alarms.id))
        .where(eq(alarms.difficulty, 'medium'))
    )
    .union(
      db
        .select({ difficulty: alarms.difficulty })
        .from(alarmCompletions)
        .innerJoin(alarms, eq(alarmCompletions.alarmId, alarms.id))
        .where(eq(alarms.difficulty, 'hard'))
    );

  const difficulties = new Set(completions.map((c) => c.difficulty));
  return difficulties.size === 3;
}

/**
 * Check if specific challenge type count meets target
 */
export async function checkChallengeTypeCount(
  type: 'math' | 'memory' | 'logic',
  target: number
): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  const count = completions.filter((c) => c.challengeType === type).length;
  return count >= target;
}

/**
 * Get progress for specific challenge type
 */
export async function getChallengeTypeProgress(
  type: 'math' | 'memory' | 'logic',
  target: number
): Promise<number> {
  const completions = await db.select().from(alarmCompletions);
  const count = completions.filter((c) => c.challengeType === type).length;
  return Math.min(count, target);
}

/**
 * Check if number of Hard challenges meets target
 */
export async function checkHardChallenges(target: number): Promise<boolean> {
  const { alarms } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');

  const completions = await db
    .select()
    .from(alarmCompletions)
    .innerJoin(alarms, eq(alarmCompletions.alarmId, alarms.id))
    .where(eq(alarms.difficulty, 'hard'));

  return completions.length >= target;
}

/**
 * Check if user has woken up before a specific time
 */
export async function checkEarlyWakeUp(time: string): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  return completions.some((c) => {
    const targetHour = parseInt(c.targetTime.split(':')[0]);
    const targetMin = parseInt(c.targetTime.split(':')[1]);
    const targetTimeValue = targetHour * 60 + targetMin;

    const checkHour = parseInt(time.split(':')[0]);
    const checkMin = parseInt(time.split(':')[1]);
    const checkTimeValue = checkHour * 60 + checkMin;

    return targetTimeValue < checkTimeValue;
  });
}

/**
 * Check if weekend alarm count meets target
 */
export async function checkWeekendAlarms(target: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  const weekendCount = completions.filter((c) => {
    const day = dayjs(c.date).day();
    return day === 0 || day === 6; // Sunday or Saturday
  }).length;
  return weekendCount >= target;
}

/**
 * Get weekend alarms progress
 */
export async function getWeekendAlarmsProgress(target: number): Promise<number> {
  const completions = await db.select().from(alarmCompletions);
  const weekendCount = completions.filter((c) => {
    const day = dayjs(c.date).day();
    return day === 0 || day === 6;
  }).length;
  return Math.min(weekendCount, target);
}

/**
 * Check if user came back after a gap of X days
 */
export async function checkComebackAfterGap(gapDays: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions).orderBy(alarmCompletions.date);

  if (completions.length < 2) return false;

  // Check for any gap >= gapDays
  for (let i = 1; i < completions.length; i++) {
    const prevDate = dayjs(completions[i - 1].date);
    const currDate = dayjs(completions[i].date);
    const diff = currDate.diff(prevDate, 'day');

    if (diff >= gapDays) {
      return true;
    }
  }

  return false;
}

/**
 * Check for 7 consecutive days with first-attempt success
 */
export async function checkFlawlessWeek(): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions).orderBy(alarmCompletions.date);

  if (completions.length < 7) return false;

  // Check for 7 consecutive days with attempts = 1
  let consecutiveDays = 0;

  for (let i = 0; i < completions.length; i++) {
    if (completions[i].attempts === 1) {
      consecutiveDays++;

      // Check if next day is consecutive
      if (i < completions.length - 1) {
        const currentDate = dayjs(completions[i].date);
        const nextDate = dayjs(completions[i + 1].date);
        const diff = nextDate.diff(currentDate, 'day');

        if (diff !== 1) {
          consecutiveDays = 0;
        }
      }

      if (consecutiveDays >= 7) return true;
    } else {
      consecutiveDays = 0;
    }
  }

  return false;
}

/**
 * Check for X consecutive days with first-attempt success (no failures)
 */
export async function checkFlawlessStreak(days: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions).orderBy(alarmCompletions.date);

  if (completions.length < days) return false;

  // Check for X consecutive days with attempts = 1
  let consecutiveDays = 0;

  for (let i = 0; i < completions.length; i++) {
    if (completions[i].attempts === 1) {
      consecutiveDays++;

      // Check if next day is consecutive
      if (i < completions.length - 1) {
        const currentDate = dayjs(completions[i].date);
        const nextDate = dayjs(completions[i + 1].date);
        const diff = nextDate.diff(currentDate, 'day');

        if (diff !== 1) {
          consecutiveDays = 0;
        }
      }

      if (consecutiveDays >= days) return true;
    } else {
      consecutiveDays = 0;
    }
  }

  return false;
}

/**
 * Check if number of Adaptive AI challenges meets target
 */
export async function checkAdaptiveChallenges(target: number): Promise<boolean> {
  // TODO: Add adaptive difficulty tracking to alarmCompletions
  // For now, return false as placeholder
  return false;
}

/**
 * Check if user has completed at least X of each challenge type (balanced)
 */
export async function checkBalancedChallenges(target: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  const mathCount = completions.filter((c) => c.challengeType === 'math').length;
  const memoryCount = completions.filter((c) => c.challengeType === 'memory').length;
  const logicCount = completions.filter((c) => c.challengeType === 'logic').length;

  return mathCount >= target && memoryCount >= target && logicCount >= target;
}

/**
 * Check if user has completed at least X of each difficulty level (balanced)
 */
export async function checkBalancedDifficulties(target: number): Promise<boolean> {
  const { alarms } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');

  const allCompletions = await db
    .select({ difficulty: alarms.difficulty })
    .from(alarmCompletions)
    .innerJoin(alarms, eq(alarmCompletions.alarmId, alarms.id));

  const easyCount = allCompletions.filter((c) => c.difficulty === 'easy').length;
  const mediumCount = allCompletions.filter((c) => c.difficulty === 'medium').length;
  const hardCount = allCompletions.filter((c) => c.difficulty === 'hard').length;

  return easyCount >= target && mediumCount >= target && hardCount >= target;
}

/**
 * Check if user has mastered all challenge types (X completions each)
 */
export async function checkAllChallengesMastery(target: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  const mathCount = completions.filter((c) => c.challengeType === 'math').length;
  const memoryCount = completions.filter((c) => c.challengeType === 'memory').length;
  const logicCount = completions.filter((c) => c.challengeType === 'logic').length;

  return mathCount >= target && memoryCount >= target && logicCount >= target;
}

/**
 * Check if user woke up between startTime and endTime (e.g., after midnight)
 */
export async function checkLateWakeUp(startTime: string, endTime: string): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  return completions.some((c) => {
    const targetHour = parseInt(c.targetTime.split(':')[0]);
    const targetMin = parseInt(c.targetTime.split(':')[1]);
    const targetTimeValue = targetHour * 60 + targetMin;

    const startHour = parseInt(startTime.split(':')[0]);
    const startMin = parseInt(startTime.split(':')[1]);
    const startTimeValue = startHour * 60 + startMin;

    const endHour = parseInt(endTime.split(':')[0]);
    const endMin = parseInt(endTime.split(':')[1]);
    const endTimeValue = endHour * 60 + endMin;

    return targetTimeValue >= startTimeValue && targetTimeValue <= endTimeValue;
  });
}

/**
 * Check if user woke up at the same minute for X consecutive days
 */
export async function checkConsistentMinute(days: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions).orderBy(alarmCompletions.date);

  if (completions.length < days) return false;

  // Check for consecutive days with same minute
  for (let i = 0; i <= completions.length - days; i++) {
    const firstMinute = parseInt(completions[i].targetTime.split(':')[1]);
    let isConsistent = true;

    for (let j = i + 1; j < i + days; j++) {
      const currentMinute = parseInt(completions[j].targetTime.split(':')[1]);
      const prevDate = dayjs(completions[j - 1].date);
      const currDate = dayjs(completions[j].date);

      // Check if dates are consecutive and minutes match
      if (currDate.diff(prevDate, 'day') !== 1 || currentMinute !== firstMinute) {
        isConsistent = false;
        break;
      }
    }

    if (isConsistent) return true;
  }

  return false;
}

/**
 * Check if user completed X alarms within Y days (marathon)
 */
export async function checkMonthlyMarathon(alarms: number, days: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions).orderBy(alarmCompletions.date);

  if (completions.length < alarms) return false;

  // Check for any period where alarms were completed within days
  for (let i = 0; i <= completions.length - alarms; i++) {
    const firstDate = dayjs(completions[i].date);
    const lastDate = dayjs(completions[i + alarms - 1].date);
    const diff = lastDate.diff(firstDate, 'day');

    if (diff <= days) {
      return true;
    }
  }

  return false;
}

/**
 * Check for X consecutive perfect scores (100/100)
 */
export async function checkConsecutivePerfectScores(count: number): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions).orderBy(alarmCompletions.date);

  if (completions.length < count) return false;

  let consecutiveCount = 0;

  for (const completion of completions) {
    if (completion.cognitiveScore === 100) {
      consecutiveCount++;
      if (consecutiveCount >= count) return true;
    } else {
      consecutiveCount = 0;
    }
  }

  return false;
}

/**
 * Check if user woke up at a specific lucky time (e.g., 07:07)
 */
export async function checkLuckyTime(time: string): Promise<boolean> {
  const completions = await db.select().from(alarmCompletions);
  return completions.some((c) => c.targetTime === time);
}

/**
 * Check if user has shared X achievements (social feature)
 */
export async function checkAchievementShares(count: number): Promise<boolean> {
  // TODO: Implement achievement sharing tracking
  // For now, return false as placeholder
  return false;
}

/**
 * Check if user shared a streak of at least X days
 */
export async function checkStreakShare(minStreak: number): Promise<boolean> {
  // TODO: Implement streak sharing tracking
  // For now, return false as placeholder
  return false;
}

/**
 * Check if user has helped X community members
 */
export async function checkCommunityHelps(count: number): Promise<boolean> {
  // TODO: Implement community help tracking
  // For now, return false as placeholder
  return false;
}
