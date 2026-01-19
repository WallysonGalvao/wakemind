/**
 * Custom hook to encapsulate all performance data logic
 * Provides a clean, testable interface for performance metrics
 */

import { useEffect, useState } from 'react';

import * as performanceService from '@/db/functions/performance';

export interface PerformanceMetrics {
  // Streak metrics
  currentStreak: number;
  streakGain: number;

  // Score metrics
  averageCognitiveScore: number;
  scoreGain: number;

  // Weekly metrics
  weeklyExecutionRate: number;
  previousWeekExecutionRate: number;

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

const DEFAULT_METRICS: PerformanceMetrics = {
  currentStreak: 0,
  streakGain: 0,
  averageCognitiveScore: 0,
  scoreGain: 0,
  weeklyExecutionRate: 0,
  previousWeekExecutionRate: 0,
  currentReactionTime: DEFAULT_FALLBACK_VALUES.currentReactionTime,
  averageReactionTime: DEFAULT_FALLBACK_VALUES.averageReactionTime,
  isBestReactionTime: false,
  recentReactionTimes: Array.from(DEFAULT_FALLBACK_VALUES.recentReactionTimes),
  targetTime: DEFAULT_FALLBACK_VALUES.targetTime,
  actualTime: DEFAULT_FALLBACK_VALUES.actualTime,
};

/**
 * Hook to get all performance-related data in a structured format
 * Loads data asynchronously from SQLite database
 */
export function usePerformanceData(): PerformanceMetrics & { isLoading: boolean } {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      try {
        // Load all metrics in parallel
        const [
          currentStreak,
          averageCognitiveScore,
          weeklyStats,
          previousWeekExecutionRate,
          recentReactionTimes,
          streakGain,
          scoreGain,
        ] = await Promise.all([
          performanceService.getCurrentStreak(),
          performanceService.getAverageCognitiveScore(),
          performanceService.getWeeklyStats(),
          performanceService.getPreviousWeekExecutionRate(),
          performanceService.getRecentReactionTimes(7),
          performanceService.getStreakGain(),
          performanceService.getScoreGain(),
        ]);

        // Get last completion from recent reaction times data (if available)
        // Note: We could add a getLastCompletion() function to the service if needed
        // For now, using defaults or calculating from available data

        // Calculate reaction time metrics
        const hasReactionTimes = recentReactionTimes.length > 0;
        const currentReactionTime = hasReactionTimes
          ? recentReactionTimes[recentReactionTimes.length - 1]
          : DEFAULT_FALLBACK_VALUES.currentReactionTime;

        const averageReactionTimeValue = hasReactionTimes
          ? Math.round(
              recentReactionTimes.reduce((a: number, b: number) => a + b, 0) /
                recentReactionTimes.length
            )
          : DEFAULT_FALLBACK_VALUES.averageReactionTime;

        const isBestReactionTime = currentReactionTime <= Math.min(...recentReactionTimes, 999);

        if (isMounted) {
          setMetrics({
            currentStreak,
            streakGain,
            averageCognitiveScore,
            scoreGain,
            weeklyExecutionRate: weeklyStats.executionRate,
            previousWeekExecutionRate,
            currentReactionTime,
            averageReactionTime: averageReactionTimeValue,
            isBestReactionTime,
            recentReactionTimes: hasReactionTimes
              ? recentReactionTimes
              : Array.from(DEFAULT_FALLBACK_VALUES.recentReactionTimes),
            targetTime: DEFAULT_FALLBACK_VALUES.targetTime,
            actualTime: DEFAULT_FALLBACK_VALUES.actualTime,
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[usePerformanceData] Error loading metrics:', error);
        if (isMounted) {
          setMetrics(DEFAULT_METRICS);
          setIsLoading(false);
        }
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...metrics, isLoading };
}
