/**
 * Achievement Rewards Configuration
 * Centralized MP reward values based on achievement tier
 */

import type { AchievementTier } from '../types/achievement.types';

/**
 * MP rewards by tier
 * Future: Could be made configurable via remote config
 */
export const MP_REWARDS_BY_TIER: Record<AchievementTier, number> = {
  bronze: 50,
  silver: 100,
  gold: 200,
  platinum: 500,
};

/**
 * Default MP reward (for backwards compatibility)
 */
export const DEFAULT_MP_REWARD = 50;

/**
 * Calculate MP reward for an achievement
 * Uses custom reward if provided, otherwise falls back to tier-based reward
 */
export function getAchievementReward(
  tierOrAchievement: AchievementTier | { tier: string; reward?: number }
): number {
  // If it's an object with possible custom reward
  if (typeof tierOrAchievement === 'object') {
    if (tierOrAchievement.reward !== undefined) {
      return tierOrAchievement.reward;
    }
    return MP_REWARDS_BY_TIER[tierOrAchievement.tier as AchievementTier] || DEFAULT_MP_REWARD;
  }
  
  // Otherwise it's just a tier string
  return MP_REWARDS_BY_TIER[tierOrAchievement] || DEFAULT_MP_REWARD;
}
