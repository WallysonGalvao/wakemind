import dayjs from 'dayjs';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';

export interface AlarmCompletionRecord {
  id: string;
  targetTime: string; // HH:mm format
  actualTime: string; // ISO string
  cognitiveScore: number; // 0-100
  reactionTime: number; // milliseconds
  challengeType: string;
  date: string; // ISO date
}

export interface WeeklyStats {
  executionRate: number; // 0-100
  averageCognitiveScore: number;
  averageReactionTime: number;
  completedDays: number;
  totalScheduledDays: number;
}

/**
 * Records a new alarm completion or updates today's existing record
 */
export async function recordAlarmCompletion(
  record: Omit<AlarmCompletionRecord, 'id' | 'date'>
): Promise<void> {
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');

  // Check if already completed today
  const existingRecords = await db
    .select()
    .from(alarmCompletions)
    .where(eq(sql`date(${alarmCompletions.date})`, today));

  if (existingRecords.length > 0) {
    // Update today's record
    await db
      .update(alarmCompletions)
      .set({
        targetTime: record.targetTime,
        actualTime: record.actualTime,
        cognitiveScore: record.cognitiveScore,
        reactionTime: record.reactionTime,
        challengeType: record.challengeType,
      })
      .where(eq(alarmCompletions.id, existingRecords[0].id));
    return;
  }

  const newRecord: AlarmCompletionRecord = {
    id: `${Date.now()}_${Math.random()}`,
    ...record,
    date: now.toISOString(),
  };

  // Insert new record
  await db.insert(alarmCompletions).values(newRecord);
}

/**
 * Gets statistics for the current week (last 7 days)
 */
export async function getWeeklyStats(): Promise<WeeklyStats> {
  const now = dayjs();
  const weekStart = now.subtract(6, 'day').startOf('day').toISOString();

  const weekRecords = await db
    .select()
    .from(alarmCompletions)
    .where(gte(alarmCompletions.date, weekStart));

  const completedDays = new Set(weekRecords.map((r) => dayjs(r.date).format('YYYY-MM-DD'))).size;

  const totalScheduledDays = 7;
  const executionRate = (completedDays / totalScheduledDays) * 100;

  const averageCognitiveScore =
    weekRecords.length > 0
      ? weekRecords.reduce((sum, r) => sum + r.cognitiveScore, 0) / weekRecords.length
      : 0;

  const averageReactionTime =
    weekRecords.length > 0
      ? weekRecords.reduce((sum, r) => sum + r.reactionTime, 0) / weekRecords.length
      : 0;

  return {
    executionRate: Math.round(executionRate),
    averageCognitiveScore: Math.round(averageCognitiveScore),
    averageReactionTime: Math.round(averageReactionTime),
    completedDays,
    totalScheduledDays,
  };
}

/**
 * Gets execution rate for the previous week (8-14 days ago)
 */
export async function getPreviousWeekExecutionRate(): Promise<number> {
  const now = dayjs();
  const previousWeekStart = now.subtract(13, 'day').startOf('day').toISOString();
  const previousWeekEnd = now.subtract(7, 'day').endOf('day').toISOString();

  const previousWeekRecords = await db
    .select()
    .from(alarmCompletions)
    .where(
      and(
        gte(alarmCompletions.date, previousWeekStart),
        lte(alarmCompletions.date, previousWeekEnd)
      )
    );

  const completedDays = new Set(previousWeekRecords.map((r) => dayjs(r.date).format('YYYY-MM-DD')))
    .size;

  const totalScheduledDays = 7;
  const executionRate = (completedDays / totalScheduledDays) * 100;

  return Math.round(executionRate);
}

/**
 * Calculates current consecutive day streak
 */
export async function getCurrentStreak(): Promise<number> {
  // Get all completions ordered by date desc
  const allRecords = await db.select().from(alarmCompletions).orderBy(desc(alarmCompletions.date));

  if (allRecords.length === 0) return 0;

  const today = dayjs();
  let streak = 0;
  let currentDate = today;

  // Check from today backwards for consecutive days
  for (let i = 0; i < allRecords.length; i++) {
    const recordDate = dayjs(allRecords[i].date);
    const expectedDate = currentDate.subtract(streak, 'day');

    // If record matches expected date (today, yesterday, etc)
    if (recordDate.format('YYYY-MM-DD') === expectedDate.format('YYYY-MM-DD')) {
      streak++;
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

/**
 * Finds the longest streak in history
 */
export async function getLongestStreak(): Promise<number> {
  const allRecords = await db.select().from(alarmCompletions).orderBy(alarmCompletions.date);

  if (allRecords.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < allRecords.length; i++) {
    const prevDate = dayjs(allRecords[i - 1].date);
    const currDate = dayjs(allRecords[i].date);
    const diffDays = currDate.diff(prevDate, 'day');

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    // if diffDays === 0 (same day), keep currentStreak
  }

  return longestStreak;
}

/**
 * Gets total number of alarms completed
 */
export async function getTotalAlarmsCompleted(): Promise<number> {
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(alarmCompletions);

  return result[0]?.count || 0;
}

/**
 * Calculates average cognitive score across all completions
 */
export async function getAverageCognitiveScore(): Promise<number> {
  const result = await db
    .select({ avg: sql<number>`AVG(${alarmCompletions.cognitiveScore})` })
    .from(alarmCompletions);

  return Math.round(result[0]?.avg || 0);
}

/**
 * Gets reaction times for the current week (Monday-Sunday)
 */
export async function getRecentReactionTimes(days = 7): Promise<number[]> {
  const today = dayjs();
  const result: number[] = [];

  // Get the start of the current week (Monday)
  const weekStart = today.startOf('week').add(1, 'day');

  // Fetch all records for current week
  const weekRecords = await db
    .select()
    .from(alarmCompletions)
    .where(gte(alarmCompletions.date, weekStart.toISOString()));

  console.log('[getRecentReactionTimes] weekRecords:', weekRecords);

  // Generate array for Monday through Sunday of current week
  for (let i = 0; i < days; i++) {
    const targetDate = weekStart.add(i, 'day').format('YYYY-MM-DD');
    const record = weekRecords.find((r) => dayjs(r.date).format('YYYY-MM-DD') === targetDate);
    console.log(`[getRecentReactionTimes] Day ${i} (${targetDate}):`, record?.reactionTime || 0);
    result.push(record?.reactionTime || 0);
  }

  console.log('[getRecentReactionTimes] result:', result);
  return result;
}

/**
 * Calculates streak gain from completing today
 */
export async function getStreakGain(): Promise<number> {
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  // Check if completed today
  const todayRecords = await db
    .select()
    .from(alarmCompletions)
    .where(eq(sql`date(${alarmCompletions.date})`, today));

  if (todayRecords.length === 0) return 0;

  // Count total records
  const totalCount = await db.select({ count: sql<number>`COUNT(*)` }).from(alarmCompletions);

  if (totalCount[0].count === 1) return 1;

  // Check if completed yesterday
  const yesterdayRecords = await db
    .select()
    .from(alarmCompletions)
    .where(eq(sql`date(${alarmCompletions.date})`, yesterday));

  if (yesterdayRecords.length > 0) {
    return 1;
  }

  return 1;
}

/**
 * Calculates cognitive score improvement from today vs previous average
 */
export async function getScoreGain(): Promise<number> {
  const today = dayjs().format('YYYY-MM-DD');

  // Get today's completion
  const todayRecords = await db
    .select()
    .from(alarmCompletions)
    .where(eq(sql`date(${alarmCompletions.date})`, today));

  if (todayRecords.length === 0) return 0;

  const todayRecord = todayRecords[0];

  // Get previous records (excluding today)
  const previousRecords = await db
    .select()
    .from(alarmCompletions)
    .where(sql`date(${alarmCompletions.date}) < ${today}`);

  if (previousRecords.length === 0) return todayRecord.cognitiveScore;

  // Calculate previous average
  const previousAverage =
    previousRecords.reduce((sum, r) => sum + r.cognitiveScore, 0) / previousRecords.length;

  return Math.round(todayRecord.cognitiveScore - previousAverage);
}

/**
 * Deletes all performance data
 */
export async function resetPerformance(): Promise<void> {
  await db.delete(alarmCompletions);
}
