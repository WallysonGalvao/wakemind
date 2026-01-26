import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { AnimatedCounter } from '@/components/animated-counter';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { PeriodType } from '@/features/dashboard/types';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface SleepQualityScoreProps {
  avgSleepHours: number;
  qualityScore: number;
  correlation: number;
  recommendation: string;
  trendDirection: 'up' | 'down' | 'stable';
  period: PeriodType;
}

export function SleepQualityScore({
  avgSleepHours,
  qualityScore,
  correlation,
  recommendation,
  trendDirection,
  period,
}: SleepQualityScoreProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  const getQualityColor = () => {
    if (qualityScore >= 80) return COLORS.green[500];
    if (qualityScore >= 60) return COLORS.brandPrimary;
    if (qualityScore >= 40) return COLORS.orange[500];
    return COLORS.red[500];
  };

  const getQualityLabel = () => {
    if (qualityScore >= 80) return t('dashboard.sleep.excellent');
    if (qualityScore >= 60) return t('dashboard.sleep.good');
    if (qualityScore >= 40) return t('dashboard.sleep.fair');
    return t('dashboard.sleep.poor');
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') return 'trending_up';
    if (trendDirection === 'down') return 'trending_down';
    return 'trending_flat';
  };

  const getCorrelationText = () => {
    if (correlation > 0.5) return t('dashboard.sleep.strongPositive');
    if (correlation > 0.2) return t('dashboard.sleep.moderate');
    if (correlation > -0.2) return t('dashboard.sleep.weak');
    return t('dashboard.sleep.negative');
  };

  return (
    <View
      className="flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark"
      style={shadowStyle}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="bedtime" size={24} color={COLORS.brandPrimary} />
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            {t('dashboard.sleep.title')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MaterialSymbol name={getTrendIcon()} size={18} color={COLORS.gray[500]} />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t(`dashboard.period.${period}`)}
          </Text>
        </View>
      </View>

      {/* Main Stats */}
      <View className="flex-row gap-4">
        {/* Quality Score */}
        <View className="flex-1 items-center rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.sleep.qualityScore')}
          </Text>
          <AnimatedCounter
            value={qualityScore}
            className="mt-1 text-3xl font-bold tabular-nums"
            style={{ color: getQualityColor() }}
          />
          <Text className="mt-1 text-xs font-medium" style={{ color: getQualityColor() }}>
            {getQualityLabel()}
          </Text>
        </View>

        {/* Avg Sleep Hours */}
        <View className="flex-1 items-center rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.sleep.avgHours')}
          </Text>
          <View className="mt-1 flex-row items-end gap-1">
            <AnimatedCounter
              value={avgSleepHours}
              decimals={1}
              className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white"
            />
            <Text className="mb-1 text-sm text-gray-500 dark:text-gray-400">h</Text>
          </View>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.sleep.perNight')}
          </Text>
        </View>
      </View>

      {/* Correlation & Recommendation */}
      <View className="gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('dashboard.sleep.correlation')}
          </Text>
          <Text className="text-xs font-semibold text-slate-900 dark:text-white">
            {getCorrelationText()}
          </Text>
        </View>

        <View className="flex-row items-start gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
          <MaterialSymbol name="tips_and_updates" size={16} color={COLORS.brandPrimary} />
          <Text className="flex-1 text-xs text-gray-600 dark:text-gray-300">
            {t(recommendation)}
          </Text>
        </View>
      </View>
    </View>
  );
}
