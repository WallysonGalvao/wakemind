import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

interface DailyInsightParams {
  variance: number;
  executionScore: number;
  streak: number;
}

/**
 * Hook to get contextual insight based on user's performance metrics
 * Returns a relevant insight message or null
 * Receives pre-computed metrics to avoid redundant database queries
 */
export function useDailyInsight({
  variance,
  executionScore,
  streak,
}: DailyInsightParams): string | null {
  const { t } = useTranslation();

  const insight = useMemo(() => {
    // Insight: Wake time variance affects reaction time (use absolute value)
    if (variance && Math.abs(variance) > 10) {
      return t('dashboard.dailyInsight.insights.wakeVariance', {
        variance: Math.round(Math.abs(variance)),
      });
    }

    // Insight: Streak milestone
    if (streak >= 30) {
      return t('dashboard.dailyInsight.insights.streakMilestone', { days: streak });
    }

    // Insight: Low execution score
    if (executionScore < 70) {
      return t('dashboard.dailyInsight.insights.lowScore');
    }

    // Insight: Excellent consistency (use absolute value)
    if (variance && Math.abs(variance) < 5) {
      return t('dashboard.dailyInsight.insights.excellentConsistency');
    }

    // Insight: Building momentum
    if (streak >= 7 && streak < 30) {
      return t('dashboard.dailyInsight.insights.buildingMomentum', { days: streak });
    }

    // Default positive insight
    if (executionScore >= 85) {
      return t('dashboard.dailyInsight.insights.keepItUp');
    }

    return null;
  }, [variance, executionScore, streak, t]);

  return insight;
}
