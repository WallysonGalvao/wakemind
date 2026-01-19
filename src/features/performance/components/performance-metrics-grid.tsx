/**
 * Performance Metrics Grid
 * Displays streak and score cards with dynamic badges
 */

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { MetricCard } from './metric-card';

import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const streakBadge =
    streakGain > 0
      ? {
          text: t('performance.daysGain', { count: streakGain }),
          color: 'text-green-400' as const,
        }
      : undefined;

  const scoreBadge =
    scoreGain !== 0
      ? {
          text: t('performance.pointsGain', { count: scoreGain }),
          color: scoreGain > 0 ? ('text-success-500' as const) : ('text-red-500' as const),
        }
      : undefined;

  const fireDepartmentColor = {
    icon: isDark ? 'text-orange-500' : 'text-orange-500',
    bgColor: isDark ? 'bg-red-500/20' : 'bg-orange-50',
  };

  const psychologyColor = {
    icon: isDark ? 'text-primary-400' : 'text-primary-500',
    bgColor: isDark ? 'bg-blue-500/20' : 'bg-blue-50',
  };

  return (
    <View className="mb-6 flex-row gap-4">
      <View className="flex-1">
        <MetricCard
          icon="local_fire_department"
          iconColor={fireDepartmentColor.icon}
          iconBgColor={fireDepartmentColor.bgColor}
          title={t('performance.streak')}
          value={currentStreak}
          subtitle={t('performance.daysConsistent')}
          badge={streakBadge}
        />
      </View>

      <View className="flex-1">
        <MetricCard
          icon="psychology"
          iconColor={psychologyColor.icon}
          iconBgColor={psychologyColor.bgColor}
          title={t('performance.score')}
          value={averageCognitiveScore}
          subtitle={t('performance.outOf100')}
          badge={scoreBadge}
        />
      </View>
    </View>
  );
}
