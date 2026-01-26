/**
 * Achievement Database Functions
 * CRUD operations for achievements and user_achievements tables
 */

import dayjs from 'dayjs';
import { eq, sql } from 'drizzle-orm';

import { db } from '@/db';
import {
  type Achievement,
  achievements,
  type UserAchievement,
  userAchievements,
} from '@/db/schema';
import type { AchievementState } from '@/features/achievements/types/achievement.types';
import { ACHIEVEMENT_REGISTRY } from '@/features/achievements/utils/achievement-registry';

/**
 * Seed all achievements into the database
 * This should be called on app initialization to ensure all achievements from registry are in the database
 */
export async function seedAchievements(): Promise<void> {
  const now = dayjs().toISOString();

  // Get existing achievements
  const existing = await db.select().from(achievements);
  const existingIds = new Set(existing.map((a) => a.id));

  // Find new achievements that need to be inserted
  const newAchievements = ACHIEVEMENT_REGISTRY.filter((def) => !existingIds.has(def.id));

  if (newAchievements.length === 0) {
    console.log(
      `[seedAchievements] All ${ACHIEVEMENT_REGISTRY.length} achievements already seeded`
    );
    return;
  }

  // Insert only new achievements
  const achievementsToInsert = newAchievements.map((def) => ({
    id: def.id,
    category: def.category,
    tier: def.tier,
    icon: def.icon,
    isSecret: def.isSecret,
    target: def.target,
    createdAt: now,
  }));

  await db.insert(achievements).values(achievementsToInsert);
  console.log(
    `[seedAchievements] Seeded ${achievementsToInsert.length} new achievements (total: ${existing.length + achievementsToInsert.length})`
  );
}

/**
 * Get all achievements (master data)
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  return await db.select().from(achievements);
}

/**
 * Get all user achievements (unlock state)
 */
export async function getUserAchievements(): Promise<UserAchievement[]> {
  return await db.select().from(userAchievements);
}

/**
 * Get all achievements with user unlock status
 */
export async function getAllAchievementsWithStatus(): Promise<AchievementState[]> {
  const allAchievements = await getAllAchievements();
  const userUnlocks = await getUserAchievements();

  return allAchievements.map((achievement) => {
    const userProgress = userUnlocks.find((u) => u.achievementId === achievement.id);
    // Get definition from registry to access icon flags
    const definition = ACHIEVEMENT_REGISTRY.find((def) => def.id === achievement.id);

    return {
      achievement: {
        id: achievement.id,
        category: achievement.category,
        tier: achievement.tier,
        icon: achievement.icon,
        isSecret: achievement.isSecret,
        isPremium: definition?.isPremium,
        target: achievement.target,
        use3DIcon: definition?.use3DIcon,
        useSkiaIcon: definition?.useSkiaIcon,
      },
      isUnlocked: !!userProgress?.unlockedAt,
      unlockedAt: userProgress?.unlockedAt || undefined,
      progress: userProgress?.progress || 0,
      target: achievement.target,
    };
  });
}

/**
 * Get achievement by ID
 */
export async function getAchievementById(id: string): Promise<Achievement | null> {
  const result = await db.select().from(achievements).where(eq(achievements.id, id));
  return result[0] || null;
}

/**
 * Get user achievement by achievement ID
 */
export async function getUserAchievementById(
  achievementId: string
): Promise<UserAchievement | null> {
  const result = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.achievementId, achievementId));
  return result[0] || null;
}

/**
 * Unlock an achievement for the user
 * Idempotent - won't unlock twice
 */
export async function unlockAchievement(achievementId: string): Promise<void> {
  const existing = await getUserAchievementById(achievementId);

  if (existing?.unlockedAt) {
    console.log(`[unlockAchievement] ${achievementId} already unlocked, skipping`);
    return;
  }

  const now = dayjs().toISOString();

  if (existing) {
    // Update existing record
    await db
      .update(userAchievements)
      .set({
        unlockedAt: now,
        updatedAt: now,
      })
      .where(eq(userAchievements.achievementId, achievementId));
  } else {
    // Create new record
    await db.insert(userAchievements).values({
      id: `${Date.now()}_${Math.random()}`,
      achievementId,
      unlockedAt: now,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`[unlockAchievement] Unlocked ${achievementId}`);
}

/**
 * Update progress for an achievement
 */
export async function updateAchievementProgress(
  achievementId: string,
  progress: number
): Promise<void> {
  const existing = await getUserAchievementById(achievementId);
  const now = dayjs().toISOString();

  if (existing) {
    // Don't update if already unlocked
    if (existing.unlockedAt) return;

    // Update existing record
    await db
      .update(userAchievements)
      .set({
        progress,
        updatedAt: now,
      })
      .where(eq(userAchievements.achievementId, achievementId));
  } else {
    // Create new record with progress
    await db.insert(userAchievements).values({
      id: `${Date.now()}_${Math.random()}`,
      achievementId,
      unlockedAt: null,
      progress,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Get count of unlocked achievements
 */
export async function getUnlockedCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userAchievements)
    .where(sql`${userAchievements.unlockedAt} IS NOT NULL`);

  return result[0]?.count || 0;
}

/**
 * Get count of unlocked achievements by tier
 */
export async function getUnlockedCountByTier(tier: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(sql`${userAchievements.unlockedAt} IS NOT NULL AND ${achievements.tier} = ${tier}`);

  return result[0]?.count || 0;
}

/**
 * Reset all user achievements (for testing/debugging)
 */
export async function resetUserAchievements(): Promise<void> {
  await db.delete(userAchievements);
  console.log('[resetUserAchievements] All user achievements cleared');
}
