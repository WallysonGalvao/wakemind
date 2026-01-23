/**
 * Achievement System Type Definitions
 */

export enum AchievementCategory {
  PROGRESSION = 'progression',
  CONSISTENCY = 'consistency',
  MASTERY = 'mastery',
  EXPLORATION = 'exploration',
  SECRET = 'secret',
  SOCIAL = 'social',
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
  isPremium?: boolean; // Whether this achievement requires Pro subscription
  target: number; // For progress tracking
  reward?: number; // Optional custom MP reward (defaults to tier-based value)
  use3DIcon?: boolean; // Whether to use 3D SVG icon instead of Material Symbol
  useSkiaIcon?: boolean; // Whether to use Skia-rendered icon (highest quality)
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
    isPremium?: boolean;
    target: number;
    reward?: number;
    use3DIcon?: boolean;
    useSkiaIcon?: boolean;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}
