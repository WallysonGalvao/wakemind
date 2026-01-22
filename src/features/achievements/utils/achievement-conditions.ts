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
  // Note: difficulty is in alarms table, need to check if user has completed
  // alarms with easy, medium, and hard difficulties
  const completions = await db.select().from(alarmCompletions);
  // For now, we'll check if they have at least 3 completions
  // TODO: Add difficulty tracking to alarmCompletions table
  return completions.length >= 3;
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
  // TODO: Add difficulty tracking to alarmCompletions
  // For now, return false as placeholder
  return false;
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
  // TODO: Need to track attempts in alarmCompletions
  // For now, return false as placeholder
  return false;
}
