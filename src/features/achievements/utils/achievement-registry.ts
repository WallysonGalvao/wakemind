/**
 * Achievement Registry
 * Centralized definition of all 46 active achievements (50 total, 4 disabled)
 */

import type { AchievementDefinition } from '../types/achievement.types';
import { AchievementCategory, AchievementTier } from '../types/achievement.types';
import * as conditions from './achievement-conditions';

export const ACHIEVEMENT_REGISTRY: AchievementDefinition[] = [
  // ============================================================================
  // PROGRESSION (10 achievements)
  // ============================================================================
  {
    id: 'first_wake',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.BRONZE,
    icon: 'wb_twilight',
    isSecret: false,
    target: 1,
    useSkiaIcon: false,
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
    useSkiaIcon: false,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },
  {
    id: 'alarm_25',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.BRONZE,
    icon: 'grade',
    isSecret: false,
    target: 25,
    useSkiaIcon: false,
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
    use3DIcon: false,
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
    use3DIcon: false,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },
  {
    id: 'alarm_250',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.GOLD,
    icon: 'military_tech',
    isSecret: false,
    target: 250,
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
    id: 'alarm_500',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.PLATINUM,
    icon: 'stars',
    isSecret: false,
    target: 500,
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
  {
    id: 'alarm_2500',
    category: AchievementCategory.PROGRESSION,
    tier: AchievementTier.PLATINUM,
    icon: 'auto_awesome',
    isSecret: false,
    target: 2500,
    conditionFn: conditions.checkTotalAlarms,
    progressFn: conditions.getTotalAlarmsProgress,
  },

  // ============================================================================
  // CONSISTENCY (9 achievements)
  // ============================================================================
  {
    id: 'streak_3',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.BRONZE,
    icon: 'local_fire_department',
    isSecret: false,
    target: 3,
    useSkiaIcon: false,
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
    useSkiaIcon: false,
    conditionFn: conditions.checkCurrentStreak,
    progressFn: conditions.getCurrentStreakProgress,
  },
  {
    id: 'streak_14',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.SILVER,
    icon: 'whatshot',
    isSecret: false,
    target: 14,
    useSkiaIcon: false,
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
    id: 'streak_60',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.GOLD,
    icon: 'flare',
    isSecret: false,
    target: 60,
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
    id: 'streak_180',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.PLATINUM,
    icon: 'rocket_launch',
    isSecret: false,
    target: 180,
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
  {
    id: 'perfect_month',
    category: AchievementCategory.CONSISTENCY,
    tier: AchievementTier.GOLD,
    icon: 'shield',
    isSecret: false,
    target: 30,
    conditionFn: async () => conditions.checkFlawlessStreak(30),
  },

  // ============================================================================
  // MASTERY (12 achievements)
  // ============================================================================
  {
    id: 'perfect_score',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.GOLD,
    icon: 'stars',
    isSecret: false,
    target: 1,
    useSkiaIcon: false,
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
    id: 'avg_score_95',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.PLATINUM,
    icon: 'workspace_premium',
    isSecret: false,
    target: 95,
    conditionFn: conditions.checkAverageScore,
  },
  {
    id: 'speed_10s',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.SILVER,
    icon: 'bolt',
    isSecret: false,
    target: 10000, // 10 seconds in milliseconds
    useSkiaIcon: false,
    conditionFn: conditions.checkReactionTime,
  },
  {
    id: 'speed_5s',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.GOLD,
    icon: 'bolt',
    isSecret: false,
    target: 5000, // 5 seconds in milliseconds
    useSkiaIcon: false,
    conditionFn: conditions.checkReactionTime,
  },
  {
    id: 'speed_3s',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.GOLD,
    icon: 'flash_on',
    isSecret: false,
    target: 3000, // 3 seconds in milliseconds
    conditionFn: conditions.checkReactionTime,
  },
  {
    id: 'speed_1s',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.PLATINUM,
    icon: 'electric_bolt',
    isSecret: false,
    target: 1000, // 1 second in milliseconds
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
    id: 'no_fail_month',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.PLATINUM,
    icon: 'verified_user',
    isSecret: false,
    target: 30,
    conditionFn: async () => conditions.checkFlawlessStreak(30),
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
  {
    id: 'hard_specialist',
    category: AchievementCategory.MASTERY,
    tier: AchievementTier.PLATINUM,
    icon: 'shield_with_house',
    isSecret: false,
    target: 100,
    conditionFn: conditions.checkHardChallenges,
  },
  // {
  //   id: 'adaptive_master',
  //   category: AchievementCategory.MASTERY,
  //   tier: AchievementTier.PLATINUM,
  //   icon: 'smart_toy',
  //   isSecret: false,
  //   target: 50,
  //   conditionFn: async (target) => conditions.checkAdaptiveChallenges(target),
  // },

  // ============================================================================
  // EXPLORATION (8 achievements)
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
    id: 'challenge_variety',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.BRONZE,
    icon: 'diversity_3',
    isSecret: false,
    target: 10,
    conditionFn: async (target) => conditions.checkBalancedChallenges(target),
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
    id: 'difficulty_balanced',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.SILVER,
    icon: 'balance',
    isSecret: false,
    target: 25,
    conditionFn: async (target) => conditions.checkBalancedDifficulties(target),
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
  {
    id: 'logic_specialist',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.SILVER,
    icon: 'extension',
    isSecret: false,
    target: 50,
    conditionFn: async (target) => conditions.checkChallengeTypeCount('logic', target),
    progressFn: async (target) => conditions.getChallengeTypeProgress('logic', target),
  },
  {
    id: 'ultimate_explorer',
    category: AchievementCategory.EXPLORATION,
    tier: AchievementTier.PLATINUM,
    icon: 'public',
    isSecret: false,
    target: 100,
    conditionFn: async (target) => conditions.checkAllChallengesMastery(target),
  },

  // ============================================================================
  // SECRET (8 achievements)
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
  {
    id: 'night_owl',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.BRONZE,
    icon: 'bedtime',
    isSecret: true,
    target: 1,
    conditionFn: async () => conditions.checkLateWakeUp('00:00', '04:59'),
  },
  {
    id: 'perfect_timing',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.SILVER,
    icon: 'schedule',
    isSecret: true,
    target: 7,
    conditionFn: async () => conditions.checkConsistentMinute(7),
  },
  {
    id: 'marathon_month',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.GOLD,
    icon: 'directions_run',
    isSecret: true,
    target: 50,
    conditionFn: async () => conditions.checkMonthlyMarathon(50, 30),
  },
  {
    id: 'zen_master',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.SILVER,
    icon: 'self_improvement',
    isSecret: true,
    target: 7,
    conditionFn: async () => conditions.checkConsecutivePerfectScores(7),
  },
  {
    id: 'lucky_seven',
    category: AchievementCategory.SECRET,
    tier: AchievementTier.BRONZE,
    icon: 'casino',
    isSecret: true,
    target: 1,
    conditionFn: async () => conditions.checkLuckyTime('07:07'),
  },

  // ============================================================================
  // SOCIAL (3 achievements) - DISABLED UNTIL SHARING FEATURE IS IMPLEMENTED
  // ============================================================================
  // TODO: Re-enable when social sharing features are implemented
  // {
  //   id: 'first_share',
  //   category: AchievementCategory.SOCIAL,
  //   tier: AchievementTier.BRONZE,
  //   icon: 'share',
  //   isSecret: false,
  //   target: 1,
  //   conditionFn: async () => conditions.checkAchievementShares(1),
  // },
  // {
  //   id: 'streak_sharer',
  //   category: AchievementCategory.SOCIAL,
  //   tier: AchievementTier.SILVER,
  //   icon: 'group',
  //   isSecret: false,
  //   target: 1,
  //   conditionFn: async () => conditions.checkStreakShare(30),
  // },
  // {
  //   id: 'motivator',
  //   category: AchievementCategory.SOCIAL,
  //   tier: AchievementTier.BRONZE,
  //   icon: 'volunteer_activism',
  //   isSecret: false,
  //   target: 5,
  //   conditionFn: async () => conditions.checkCommunityHelps(5),
  // },
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
