/**
 * Custom hook to encapsulate all performance data logic
 * Provides a clean, testable interface for performance metrics
 */

import { useMemo } from 'react';

import dayjs from 'dayjs';

import { usePerformanceStore } from '@/stores/use-performance-store';

export interface PerformanceMetrics {
  // Streak metrics
  currentStreak: number;
  streakGain: number;

  // Score metrics
  averageCognitiveScore: number;
  scoreGain: number;

  // Weekly metrics
  weeklyExecutionRate: number;

  // Reaction time metrics
  currentReactionTime: number;
  averageReactionTime: number;
  isBestReactionTime: boolean;
  recentReactionTimes: number[];

  // Time comparison
  targetTime: string;
  actualTime: string;
}

const DEFAULT_FALLBACK_VALUES = {
  targetTime: '05:00',
  actualTime: '05:02',
  currentReactionTime: 240,
  averageReactionTime: 258,
  recentReactionTimes: [320, 290, 350, 260, 280, 250, 240] as const,
} as const;

/**
 * Hook to get all performance-related data in a structured format
 * Memoizes calculations for optimal performance
 */
export function usePerformanceData(): PerformanceMetrics {
  const store = usePerformanceStore();

  const metrics = useMemo(() => {
    const {
      getCurrentStreak,
      getAverageCognitiveScore,
      getWeeklyStats,
      getRecentReactionTimes,
      getStreakGain,
      getScoreGain,
      completionHistory,
    } = store;

    // Get basic metrics
    const currentStreak = getCurrentStreak();
    const averageCognitiveScore = getAverageCognitiveScore();
    const weeklyStats = getWeeklyStats();
    const recentReactionTimes = getRecentReactionTimes(7);
    const streakGain = getStreakGain();
    const scoreGain = getScoreGain();

    // Get last completion for time comparison
    const lastCompletion = completionHistory[completionHistory.length - 1];

    // Calculate target and actual times
    const targetTime = lastCompletion?.targetTime || DEFAULT_FALLBACK_VALUES.targetTime;
    const actualTime = lastCompletion?.actualTime
      ? dayjs(lastCompletion.actualTime).format('HH:mm')
      : DEFAULT_FALLBACK_VALUES.actualTime;

    // Calculate reaction time metrics
    const currentReactionTime =
      lastCompletion?.reactionTime || DEFAULT_FALLBACK_VALUES.currentReactionTime;

    const hasReactionTimes = recentReactionTimes.length > 0;
    const averageReactionTime = hasReactionTimes
      ? Math.round(recentReactionTimes.reduce((a, b) => a + b, 0) / recentReactionTimes.length)
      : DEFAULT_FALLBACK_VALUES.averageReactionTime;

    const isBestReactionTime = currentReactionTime <= Math.min(...recentReactionTimes, 999);

    return {
      currentStreak,
      streakGain,
      averageCognitiveScore,
      scoreGain,
      weeklyExecutionRate: weeklyStats.executionRate,
      currentReactionTime,
      averageReactionTime,
      isBestReactionTime,
      recentReactionTimes: hasReactionTimes
        ? recentReactionTimes
        : Array.from(DEFAULT_FALLBACK_VALUES.recentReactionTimes),
      targetTime,
      actualTime,
    };
  }, [store]);

  return metrics;
}
