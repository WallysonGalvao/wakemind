/**
 * Performance Metrics Grid
 * Displays streak and score cards with dynamic badges
 */

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { MetricCard } from './metric-card';

interface PerformanceMetricsGridProps {
  currentStreak: number;
  streakGain: number;
  averageCognitiveScore: number;
  scoreGain: number;
}

export function PerformanceMetricsGrid({
  currentStreak,
  streakGain,
  averageCognitiveScore,
  scoreGain,
}: PerformanceMetricsGridProps) {
  const { t } = useTranslation();

  const streakBadge =
    streakGain > 0
      ? {
          text: t('performance.daysGain', { count: streakGain }),
          color: 'text-success-500' as const,
        }
      : undefined;

  const scoreBadge =
    scoreGain !== 0
      ? {
          text: t('performance.pointsGain', { count: scoreGain }),
          color: scoreGain > 0 ? ('text-success-500' as const) : ('text-red-500' as const),
        }
      : undefined;

  return (
    <View className="mb-6 flex-row gap-4">
      <View className="flex-1">
        <MetricCard
          icon="local_fire_department"
          iconColor="text-orange-500"
          iconBgColor="bg-orange-50"
          title={t('performance.streak')}
          value={currentStreak}
          subtitle={t('performance.daysConsistent')}
          badge={streakBadge}
        />
      </View>

      <View className="flex-1">
        <MetricCard
          icon="psychology"
          iconColor="text-primary-500"
          iconBgColor="bg-blue-50"
          title={t('performance.score')}
          value={averageCognitiveScore}
          subtitle={t('performance.outOf100')}
          badge={scoreBadge}
        />
      </View>
    </View>
  );
}
