/**
 * Streak Freeze Database Functions
 * Functions to manage streak freeze tokens for Pro users
 */

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

import { FREE_TIER_LIMITS } from '@/configs/revenue-cat';
import { db } from '@/db';
import { type NewStreakFreeze, streakFreezes } from '@/db/schema';

/**
 * Get maximum streak freeze tokens based on subscription status
 */
export function getMaxStreakFreezeTokens(isPro: boolean): number {
  return isPro ? 3 : FREE_TIER_LIMITS.streakFreeze;
}

/**
 * Get all used streak freezes
 */
export async function getUsedStreakFreezes() {
  return await db.select().from(streakFreezes);
}

/**
 * Get streak freezes used in the current month
 */
export async function getMonthlyStreakFreezes(): Promise<number> {
  const startOfMonth = dayjs().startOf('month').toISOString();
  const endOfMonth = dayjs().endOf('month').toISOString();

  const freezes = await db.select().from(streakFreezes);

  // Filter by current month
  const monthlyFreezes = freezes.filter((freeze) => {
    const usedAt = dayjs(freeze.usedAt);
    return usedAt.isAfter(startOfMonth) && usedAt.isBefore(endOfMonth);
  });

  return monthlyFreezes.length;
}

/**
 * Get available streak freeze tokens for current month
 */
export async function getAvailableStreakFreezeTokens(isPro: boolean): Promise<number> {
  const maxTokens = getMaxStreakFreezeTokens(isPro);
  const usedTokens = await getMonthlyStreakFreezes();

  return Math.max(0, maxTokens - usedTokens);
}

/**
 * Check if a specific date is protected by a freeze token
 */
export async function isDateProtectedByFreeze(date: string): Promise<boolean> {
  const freezes = await db.select().from(streakFreezes).where(eq(streakFreezes.date, date));
  return freezes.length > 0;
}

/**
 * Use a streak freeze token for a specific date
 * Returns true if successful, false if no tokens available
 */
export async function useStreakFreezeToken(
  date: string,
  isPro: boolean
): Promise<{ success: boolean; message: string }> {
  // Check if Pro user
  if (!isPro) {
    return {
      success: false,
      message: 'Streak Freeze is a Pro feature',
    };
  }

  // Check if already protected
  const alreadyProtected = await isDateProtectedByFreeze(date);
  if (alreadyProtected) {
    return {
      success: false,
      message: 'This date is already protected',
    };
  }

  // Check available tokens
  const availableTokens = await getAvailableStreakFreezeTokens(isPro);
  if (availableTokens <= 0) {
    return {
      success: false,
      message: 'No streak freeze tokens available this month',
    };
  }

  // Use token
  const now = dayjs().toISOString();
  const newFreeze: NewStreakFreeze = {
    id: `freeze_${Date.now()}_${Math.random()}`,
    usedAt: now,
    date,
    createdAt: now,
  };

  await db.insert(streakFreezes).values(newFreeze);

  console.log(`[useStreakFreezeToken] Protected ${date} with freeze token`);

  return {
    success: true,
    message: 'Streak freeze activated!',
  };
}

/**
 * Get streak freeze usage history
 */
export async function getStreakFreezeHistory() {
  const freezes = await db.select().from(streakFreezes);

  return freezes.sort((a, b) => {
    return dayjs(b.usedAt).diff(dayjs(a.usedAt));
  });
}

/**
 * Delete old streak freeze records (older than 1 year)
 * Can be called periodically to clean up database
 */
export async function cleanupOldStreakFreezes(): Promise<number> {
  const oneYearAgo = dayjs().subtract(1, 'year').toISOString();
  const allFreezes = await db.select().from(streakFreezes);

  let deletedCount = 0;
  for (const freeze of allFreezes) {
    if (dayjs(freeze.usedAt).isBefore(oneYearAgo)) {
      await db.delete(streakFreezes).where(eq(streakFreezes.id, freeze.id));
      deletedCount++;
    }
  }

  console.log(`[cleanupOldStreakFreezes] Deleted ${deletedCount} old records`);
  return deletedCount;
}
