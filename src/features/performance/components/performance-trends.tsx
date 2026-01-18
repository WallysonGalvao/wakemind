/**
 * Performance Trends Section
 * Displays weekly execution and reaction speed charts
 */

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { ProgressBarCard } from './progress-bar-card';
import { TrendChartCard } from './trend-chart-card';

interface PerformanceTrendsProps {
  weeklyExecutionRate: number;
  currentReactionTime: number;
  recentReactionTimes: number[];
  averageReactionTime: number;
  isBestReactionTime: boolean;
}

const CHART_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const PREVIOUS_WEEK_EXECUTION = 85; // Could be calculated from history in the future

export function PerformanceTrends({
  weeklyExecutionRate,
  currentReactionTime,
  recentReactionTimes,
  averageReactionTime,
  isBestReactionTime,
}: PerformanceTrendsProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-col gap-4">
      <ProgressBarCard
        icon="bar_chart"
        title={t('performance.weeklyExecution')}
        value={weeklyExecutionRate}
        previousValue={PREVIOUS_WEEK_EXECUTION}
      />

      <TrendChartCard
        icon="speed"
        title={t('performance.reactionSpeed')}
        currentValue={`${currentReactionTime}ms`}
        data={recentReactionTimes}
        labels={Array.from(CHART_LABELS)}
        averageValue={averageReactionTime}
        isBestScore={isBestReactionTime}
      />
    </View>
  );
}
