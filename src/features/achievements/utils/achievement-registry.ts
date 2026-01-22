/**
 * Achievement Registry
 * Centralized definition of all 24 achievements in the MVP
 */

import type { AchievementDefinition } from '../types/achievement.types';
import { AchievementCategory, AchievementTier } from '../types/achievement.types';
import * as conditions from './achievement-conditions';

export const ACHIEVEMENT_REGISTRY: AchievementDefinition[] = [
  // ============================================================================
  // PROGRESSION (6 achievements)
  // ============================================================================
  {
    id: 'first_wake',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.BRONZE,
    icon: 'wb_twilight',
    isSecret: false,
    target: 1,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },
  {
    id: 'alarm_10',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.BRONZE,
    icon: 'emoji_events',
    isSecret: false,
    target: 10,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },
  {
    id: 'alarm_50',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.SILVER,
    icon: 'emoji_events',
    isSecret: false,
    target: 50,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },
  {
    id: 'alarm_100',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.GOLD,
    icon: 'emoji_events',
    isSecret: false,
    target: 100,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },
  {
    id: 'alarm_365',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.PLATINUM,
    icon: 'workspace_premium',
    isSecret: false,
    target: 365,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },
  {
    id: 'alarm_1000',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.PLATINUM,
    icon: 'diamond',
    isSecret: false,
    target: 1000,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },

  // ============================================================================
  // CONSISTENCY (5 achievements)
  // ============================================================================
  {
    id: 'streak_3',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.BRONZE,
    icon: 'local_fire_department',
    isSecret: false,
    target: 3,
    conditionFn: conditions.checkCurrentStreak,
    progressFn: conditions.getCurrentStreakProgress,
  },
  {
    id: 'streak_7',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.SILVER,
    icon: 'local_fire_department',
    isSecret: false,
    target: 7,
    conditionFn: conditions.checkCurrentStreak,
    progressFn: conditions.getCurrentStreakProgress,
  },
  {
    id: 'streak_30',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.GOLD,
    icon: 'local_fire_department',
    isSecret: false,
    target: 30,
    conditionFn: conditions.checkCurrentStreak,
    progressFn: conditions.getCurrentStreakProgress,
  },
  {
    id: 'streak_100',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.PLATINUM,
    icon: 'local_fire_department',
    isSecret: false,
    target: 100,
    conditionFn: conditions.checkCurrentStreak,
    progressFn: conditions.getCurrentStreakProgress,
  },
  {
    id: 'streak_365',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.PLATINUM,
    icon: 'workspace_premium',
    isSecret: false,
    target: 365,
    conditionFn: conditions.checkCurrentStreak,
    progressFn: conditions.getCurrentStreakProgress,
  },

  // ============================================================================
  // MASTERY (6 achievements)
  // ============================================================================
  {
    id: 'perfect_score',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.GOLD,
    icon: 'stars',
    isSecret: false,
    target: 1,
    conditionFn: async () => conditions.checkPerfectScore(),
  },
  {
    id: 'avg_score_90',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.GOLD,
    icon: 'psychology',
    isSecret: false,
    target: 90,
    conditionFn: conditions.checkAverageScore,
  },
  {
    id: 'speed_10s',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.SILVER,
    icon: 'bolt',
    isSecret: false,
    target: 10000, // 10 seconds in milliseconds
    conditionFn: conditions.checkReactionTime,
  },
  {
    id: 'speed_5s',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.GOLD,
    icon: 'bolt',
    isSecret: false,
    target: 5000, // 5 seconds in milliseconds
    conditionFn: conditions.checkReactionTime,
  },
  {
    id: 'no_fail_week',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.GOLD,
    icon: 'verified',
    isSecret: false,
    target: 7,
    conditionFn: async () => conditions.checkFlawlessWeek(),
  },
  {
    id: 'hard_master',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.PLATINUM,
    icon: 'military_tech',
    isSecret: false,
    target: 50,
    conditionFn: conditions.checkHardChallenges,
  },

  // ============================================================================
  // EXPLORATION (4 achievements)
  // ============================================================================
  {
    id: 'all_challenges',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.BRONZE,
    icon: 'explore',
    isSecret: false,
    target: 3,
    conditionFn: async () => conditions.checkAllChallengeTypes(),
  },
  {
    id: 'all_difficulties',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.SILVER,
    icon: 'tune',
    isSecret: false,
    target: 3,
    conditionFn: async () => conditions.checkAllDifficulties(),
  },
  {
    id: 'math_specialist',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.SILVER,
    icon: 'calculate',
    isSecret: false,
    target: 50,
    conditionFn: async (target) => conditions.checkChallengeTypeCount('math', target),
    progressFn: async (target) => conditions.getChallengeTypeProgress('math', target),
  },
  {
    id: 'memory_master',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.SILVER,
    icon: 'psychology',
    isSecret: false,
    target: 50,
    conditionFn: async (target) => conditions.checkChallengeTypeCount('memory', target),
    progressFn: async (target) => conditions.getChallengeTypeProgress('memory', target),
  },

  // ============================================================================
  // SECRET (3 achievements)
  // ============================================================================
  {
    id: 'early_riser',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.SILVER,
    icon: 'wb_twilight',
    isSecret: true,
    target: 1,
    conditionFn: async () => conditions.checkEarlyWakeUp('05:00'),
  },
  {
    id: 'weekend_warrior',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.BRONZE,
    icon: 'celebration',
    isSecret: true,
    target: 10,
    conditionFn: conditions.checkWeekendAlarms,
    progressFn: conditions.getWeekendAlarmsProgress,
  },
  {
    id: 'comeback_kid',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.SILVER,
    icon: 'restore',
    isSecret: true,
    target: 30,
    conditionFn: async () => conditions.checkComebackAfterGap(30),
  },
];

/**
 * Get achievement definition by ID
 */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_REGISTRY.find((a) => a.id === id);
}

/**
 * Get all achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENT_REGISTRY.filter((a) => a.category === category);
}

/**
 * Get all achievements by tier
 */
export function getAchievementsByTier(tier: AchievementTier): AchievementDefinition[] {
  return ACHIEVEMENT_REGISTRY.filter((a) => a.tier === tier);
}

/**
 * Get total number of achievements
 */
export function getTotalAchievementsCount(): number {
  return ACHIEVEMENT_REGISTRY.length;
}
