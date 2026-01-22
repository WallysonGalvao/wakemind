/**
 * Achievement System Type Definitions
 */

export enum AchievementCategory {
  PROGRESSION = 'progression',
  CONSISTENCY = 'consistency',
  MASTERY = 'mastery',
  EXPLORATION = 'exploration',
  SECRET = 'secret',
}

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string; // Material symbol name
  isSecret: boolean;
  target: number; // For progress tracking
  conditionFn: (target: number) => Promise<boolean>;
  progressFn?: (target: number) => Promise<number>; // Returns current progress
}

export interface AchievementState {
  achievement: {
    id: string;
    category: string;
    tier: string;
    icon: string;
    isSecret: boolean;
    target: number;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}
