import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { AnimatedCounter } from '@/components/animated-counter';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { PeriodType } from '@/features/dashboard/types';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface SnoozeAnalyticsProps {
  avgSnoozeCount: number;
  totalSnoozes: number;
  totalTimeLostMinutes: number;
  firstTouchRate: number;
  trendDirection: 'up' | 'down' | 'stable';
  period: PeriodType;
}

export function SnoozeAnalytics({
  avgSnoozeCount,
  totalSnoozes,
  totalTimeLostMinutes,
  firstTouchRate,
  trendDirection,
  period,
}: SnoozeAnalyticsProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  // Determine color based on performance
  const getTrendColor = () => {
    if (trendDirection === 'down') return COLORS.green[500];
    if (trendDirection === 'up') return COLORS.red[500];
    return COLORS.gray[500];
  };

  const getTrendIcon = () => {
    if (trendDirection === 'down') return 'trending_down';
    if (trendDirection === 'up') return 'trending_up';
    return 'trending_flat';
  };

  const getPerformanceStatus = () => {
    if (firstTouchRate >= 80)
      return { text: t('dashboard.snooze.excellent'), color: COLORS.green[500] };
    if (firstTouchRate >= 60)
      return { text: t('dashboard.snooze.good'), color: COLORS.brandPrimary };
    if (firstTouchRate >= 40)
      return { text: t('dashboard.snooze.fair'), color: COLORS.orange[500] };
    return { text: t('dashboard.snooze.needsWork'), color: COLORS.red[500] };
  };

  const performance = getPerformanceStatus();

  return (
    <View
      className="flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#1a2233]"
      style={shadowStyle}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="snooze" size={24} color={COLORS.brandPrimary} />
          <Text className="text-base font-semibold text-[#0F1621] dark:text-white">
            {t('dashboard.snooze.title')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MaterialSymbol name={getTrendIcon()} size={18} color={getTrendColor()} />
          <Text className="text-xs text-slate-500 dark:text-gray-400">
            {t(`dashboard.period.${period}`)}
          </Text>
        </View>
      </View>

      {/* Main Stats Grid */}
      <View className="flex-row gap-4">
        {/* Avg Snooze Count */}
        <View className="flex-1 rounded-lg bg-slate-50 p-3 dark:bg-[#0d1117]">
          <Text className="text-xs text-slate-500 dark:text-gray-400">
            {t('dashboard.snooze.avgPerAlarm')}
          </Text>
          <AnimatedCounter
            value={avgSnoozeCount}
            decimals={1}
            className="mt-1 text-2xl font-bold text-[#0F1621] dark:text-white"
          />
        </View>

        {/* First Touch Rate */}
        <View className="flex-1 rounded-lg bg-slate-50 p-3 dark:bg-[#0d1117]">
          <Text className="text-xs text-slate-500 dark:text-gray-400">
            {t('dashboard.snooze.firstTouch')}
          </Text>
          <View className="mt-1 flex-row items-end gap-1">
            <AnimatedCounter
              value={firstTouchRate}
              className="text-2xl font-bold text-[#0F1621] dark:text-white"
            />
            <Text className="mb-0.5 text-lg font-semibold text-slate-500 dark:text-gray-400">
              %
            </Text>
          </View>
        </View>
      </View>

      {/* Secondary Stats */}
      <View className="flex-row items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
        <View>
          <Text className="text-xs text-slate-500 dark:text-gray-400">
            {t('dashboard.snooze.totalSnoozes')}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold text-[#0F1621] dark:text-white">
            {totalSnoozes}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-slate-500 dark:text-gray-400">
            {t('dashboard.snooze.timeLost')}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold text-[#0F1621] dark:text-white">
            {totalTimeLostMinutes} {t('dashboard.snooze.minutes')}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-xs text-slate-500 dark:text-gray-400">
            {t('dashboard.snooze.status')}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold" style={{ color: performance.color }}>
            {performance.text}
          </Text>
        </View>
      </View>
    </View>
  );
}
