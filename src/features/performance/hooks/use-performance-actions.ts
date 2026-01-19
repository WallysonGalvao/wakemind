/**
 * Custom hook for performance screen actions
 * Encapsulates navigation and sharing logic
 */

import { useCallback } from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Share } from 'react-native';

import { AnalyticsEvents } from '@/analytics';

interface PerformanceActionsParams {
  currentStreak: number;
  averageCognitiveScore: number;
  weeklyExecutionRate: number;
  targetTime: string;
  actualTime: string;
}

export interface PerformanceActions {
  handleShare: () => Promise<void>;
  handleStartDay: () => void;
}

/**
 * Hook to handle all performance screen actions
 * Memoizes handlers to prevent unnecessary re-renders
 */
export function usePerformanceActions({
  currentStreak,
  averageCognitiveScore,
  weeklyExecutionRate,
  targetTime,
  actualTime,
}: PerformanceActionsParams): PerformanceActions {
  const { t } = useTranslation();

  const handleShare = useCallback(async () => {
    try {
      const message =
        `🎯 ${t('performance.missionAccomplished')}!\n\n` +
        `🔥 ${t('performance.streak')}: ${currentStreak} ${t('performance.daysConsistent').toLowerCase()}\n` +
        `🧠 ${t('performance.score')}: ${averageCognitiveScore}/100\n` +
        `📊 ${t('performance.weeklyExecution')}: ${weeklyExecutionRate}%\n\n` +
        `⏰ ${t('performance.target')}: ${targetTime} | ${t('performance.actual')}: ${actualTime}\n\n` +
        `${t('performance.quote')}`;

      await Share.share({ message });
      AnalyticsEvents.performanceSummaryShared();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [t, currentStreak, averageCognitiveScore, weeklyExecutionRate, targetTime, actualTime]);

  const handleStartDay = useCallback(() => {
    router.replace('/(tabs)');
  }, []);

  return {
    handleShare,
    handleStartDay,
  };
}
