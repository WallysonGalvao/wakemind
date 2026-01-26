/**
 * Achievement History Grouper
 * Groups unlocked achievements by time period
 */

import dayjs from 'dayjs';

import { getAchievementReward } from '../constants/achievement-rewards';
import type { AchievementDefinition, AchievementState } from '../types/achievement.types';

export interface AchievementHistoryGroup {
  period: 'thisWeek' | 'lastMonth' | 'archive';
  achievements: AchievementState[];
  totalMP: number;
}

/**
 * Groups unlocked achievements by time period
 * - This Week: Unlocked in the last 7 days
 * - Last Month: Unlocked between 8-37 days ago
 * - Archive: Unlocked more than 37 days ago
 */
export function groupAchievementsByPeriod(
  achievements: AchievementState[]
): AchievementHistoryGroup[] {
  const now = dayjs();

  // Filter only unlocked achievements
  const unlocked = achievements.filter((a) => a.isUnlocked && a.unlockedAt);

  // Sort by unlock date (newest first)
  const sorted = unlocked.sort((a, b) => {
    const dateA = dayjs(a.unlockedAt);
    const dateB = dayjs(b.unlockedAt);
    return dateB.diff(dateA);
  });

  // Group by period
  const thisWeek: AchievementState[] = [];
  const lastMonth: AchievementState[] = [];
  const archive: AchievementState[] = [];

  sorted.forEach((achievement) => {
    if (!achievement.unlockedAt) return;

    const unlockedDate = dayjs(achievement.unlockedAt);
    const daysAgo = now.diff(unlockedDate, 'day');

    if (daysAgo <= 7) {
      thisWeek.push(achievement);
    } else if (daysAgo <= 37) {
      lastMonth.push(achievement);
    } else {
      archive.push(achievement);
    }
  });

  // Calculate total MP for each period
  const calculateTotalMP = (group: AchievementState[]): number => {
    return group.reduce(
      (sum, a) => sum + getAchievementReward(a.achievement as AchievementDefinition),
      0
    );
  };

  const groups: AchievementHistoryGroup[] = [];

  if (thisWeek.length > 0) {
    groups.push({
      period: 'thisWeek',
      achievements: thisWeek,
      totalMP: calculateTotalMP(thisWeek),
    });
  }

  if (lastMonth.length > 0) {
    groups.push({
      period: 'lastMonth',
      achievements: lastMonth,
      totalMP: calculateTotalMP(lastMonth),
    });
  }

  if (archive.length > 0) {
    groups.push({
      period: 'archive',
      achievements: archive,
      totalMP: calculateTotalMP(archive),
    });
  }

  return groups;
}
