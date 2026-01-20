import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import type { PeriodType } from '../types';
import { useCurrentStreak } from './use-current-streak';
import { useExecutionScore } from './use-execution-score';
import { useWakeConsistency } from './use-wake-consistency';

/**
 * Hook to get contextual insight based on user's performance metrics
 * Returns a relevant insight message or null
 */
export function useDailyInsight(period: PeriodType): string | null {
  const { t } = useTranslation();
  const wakeConsistency = useWakeConsistency(period);
  const executionScore = useExecutionScore(period);
  const streak = useCurrentStreak(period);

  const insight = useMemo(() => {
    // Insight: Wake time variance affects reaction time
    if (wakeConsistency.variance && wakeConsistency.variance > 10) {
      return t('dashboard.dailyInsight.insights.wakeVariance', {
        variance: Math.round(wakeConsistency.variance),
      });
    }

    // Insight: Streak milestone
    if (streak >= 30) {
      return t('dashboard.dailyInsight.insights.streakMilestone', { days: streak });
    }

    // Insight: Low execution score
    if (executionScore.score < 70) {
      return t('dashboard.dailyInsight.insights.lowScore');
    }

    // Insight: Excellent consistency
    if (wakeConsistency.variance && wakeConsistency.variance < 5) {
      return t('dashboard.dailyInsight.insights.excellentConsistency');
    }

    // Insight: Building momentum
    if (streak >= 7 && streak < 30) {
      return t('dashboard.dailyInsight.insights.buildingMomentum', { days: streak });
    }

    // Default positive insight
    if (executionScore.score >= 85) {
      return t('dashboard.dailyInsight.insights.keepItUp');
    }

    return null;
  }, [wakeConsistency.variance, executionScore.score, streak, t]);

  return insight;
}
