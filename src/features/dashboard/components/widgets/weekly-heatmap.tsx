import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { HeatmapDay } from '@/features/dashboard/hooks/use-weekly-heatmap';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface WeeklyHeatmapProps {
  data: HeatmapDay[];
}

export function WeeklyHeatmap({ data }: WeeklyHeatmapProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  console.log('[WeeklyHeatmap Component] Received data:', data.length, 'days');
  console.log('[WeeklyHeatmap Component] Sample data:', data.slice(0, 3));

  // Group data into weeks (7 days each)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Get day labels (S M T W T F S)
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View
      className="flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#1a2233]"
      style={shadowStyle}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="grid_on" size={24} color={COLORS.brandPrimary} />
          <Text className="text-base font-semibold text-[#0F1621] dark:text-white">
            {t('dashboard.heatmap.title')}
          </Text>
        </View>
        <Text className="text-xs text-slate-500 dark:text-gray-400">
          {t('dashboard.heatmap.last28Days')}
        </Text>
      </View>

      {/* Heatmap Grid */}
      <View className="flex-col gap-2">
        {/* Day Labels */}
        <View className="flex-row justify-between px-1">
          {dayLabels.map((label, index) => (
            <View key={index} className="w-9 items-center">
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</Text>
            </View>
          ))}
        </View>

        {/* Week Rows */}
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row justify-between">
            {week.map((day, dayIndex) => (
              <HeatmapCell key={dayIndex} day={day} />
            ))}
            {/* Fill remaining cells if week is incomplete */}
            {week.length < 7 &&
              Array.from({ length: 7 - week.length }).map((_, i) => (
                <View key={`empty-${i}`} className="h-9 w-9" />
              ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
        <Text className="text-xs text-slate-500 dark:text-gray-400">
          {t('dashboard.heatmap.legend')}
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" />
          <Text className="text-xs text-slate-500 dark:text-gray-400">Low</Text>
          <View className="h-4 w-4 rounded bg-blue-200 dark:bg-blue-900/30" />
          <View className="h-4 w-4 rounded bg-blue-400 dark:bg-blue-600/70" />
          <View className="h-4 w-4 rounded bg-blue-600 dark:bg-blue-400" />
          <Text className="text-xs text-slate-500 dark:text-gray-400">High</Text>
        </View>
      </View>
    </View>
  );
}

interface HeatmapCellProps {
  day: HeatmapDay;
}

function HeatmapCell({ day }: HeatmapCellProps) {
  const getBackgroundColor = () => {
    if (day.isEmpty) {
      return 'bg-gray-200 dark:bg-white/10';
    }

    // Score-based color intensity (blue theme like Cognitive Activation)
    if (day.score >= 90) return 'bg-blue-600 dark:bg-blue-400';
    if (day.score >= 75) return 'bg-blue-500 dark:bg-blue-500/90';
    if (day.score >= 60) return 'bg-blue-400 dark:bg-blue-600/70';
    if (day.score >= 40) return 'bg-blue-200 dark:bg-blue-700/50';
    return 'bg-blue-100 dark:bg-blue-900/30';
  };

  const isToday = dayjs(day.date).isSame(dayjs(), 'day');

  return (
    <View
      className={`h-9 w-9 items-center justify-center rounded ${getBackgroundColor()} ${isToday ? 'border-2 border-brand-primary' : ''}`}
    >
      {!day.isEmpty && (
        <Text className="text-xs font-semibold text-white">{dayjs(day.date).date()}</Text>
      )}
    </View>
  );
}
