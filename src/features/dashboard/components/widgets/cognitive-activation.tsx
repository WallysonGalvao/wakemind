import React, { useMemo } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { PeriodType } from '@/features/dashboard/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CognitiveActivationProps {
  data: Array<{ date: string; count: number; avgScore: number }>;
  period: PeriodType;
}

// Get opacity class based on score (0-100)
function getOpacityClass(score: number): string {
  if (score === 0) return 'bg-gray-200 dark:bg-white/10';
  if (score < 25) return 'bg-primary-100 dark:bg-primary-900/30';
  if (score < 50) return 'bg-primary-200 dark:bg-primary-700/50';
  if (score < 75) return 'bg-primary-400 dark:bg-primary-600/70';
  if (score < 90) return 'bg-primary-500 dark:bg-primary-500/90';
  return 'bg-primary-600 dark:bg-primary-400';
}

// Day labels (S = Sunday, M = Monday, etc.)
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CognitiveActivation({ data, period }: CognitiveActivationProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleInfoPress = () => {
    router.push('/dashboard/modals/cognitive-activation-info');
  };

  // Calculate number of weeks based on data length
  const numWeeks = Math.max(1, Math.ceil(data.length / 7));

  // Get the period description based on period type
  const periodDescription = useMemo(() => {
    switch (period) {
      case 'day':
        return t('dashboard.cognitiveActivation.period.day');
      case 'week':
        return t('dashboard.cognitiveActivation.period.week');
      case 'month':
        return t('dashboard.cognitiveActivation.period.month');
      case 'custom':
      default:
        return t('dashboard.cognitiveActivation.lastWeeks', { weeks: numWeeks });
    }
  }, [period, numWeeks, t]);

  // Create a map of date -> score for quick lookup
  const scoreMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      map.set(d.date, d.avgScore);
    });
    return map;
  }, [data]);

  // Build the grid: rows = days of week (0-6), columns = weeks
  const gridData = useMemo(() => {
    if (data.length === 0) {
      return { rows: [], totalWeeks: 0 };
    }

    // Get the first and last date in data
    const firstDate = new Date(data[0].date);
    const lastDate = new Date(data[data.length - 1].date);

    // Get day of week of first date (0 = Sunday)
    const startDayOfWeek = firstDate.getDay();

    // Calculate total days to display
    const totalDays =
      Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil((totalDays + startDayOfWeek) / 7);

    // Build grid - each row is a day of week (0-6), each column is a week
    const rows: Array<Array<{ date: string; score: number } | null>> = [];

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const row: Array<{ date: string; score: number } | null> = [];

      for (let week = 0; week < totalWeeks; week++) {
        // Calculate the date for this cell
        const dayOffset = week * 7 + dayOfWeek - startDayOfWeek;
        const cellDate = new Date(firstDate);
        cellDate.setDate(firstDate.getDate() + dayOffset);
        const dateStr = cellDate.toISOString().split('T')[0];

        // Check if this date is in our data range
        if (cellDate >= firstDate && cellDate <= lastDate) {
          const score = scoreMap.get(dateStr) || 0;
          row.push({ date: dateStr, score });
        } else {
          row.push(null); // Empty cell for dates outside range
        }
      }

      rows.push(row);
    }

    return { rows, totalWeeks };
  }, [data, scoreMap]);

  return (
    <View className="flex-col gap-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-1">
        <Text className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          {t('dashboard.cognitiveActivation.title')}
        </Text>
        <Pressable
          onPress={handleInfoPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.info')}
          accessibilityHint={t('common.infoModal.accessibilityHint')}
        >
          <MaterialSymbol
            name="info"
            size={20}
            color={isDark ? COLORS.gray[500] : COLORS.gray[400]}
          />
        </Pressable>
      </View>

      {/* Card */}
      <View className="dark:border-surface-border rounded-xl border border-gray-200 bg-white p-5 dark:bg-surface-dark">
        {/* Stats Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-medium text-gray-400">{periodDescription}</Text>
          </View>

          {/* Legend */}
          <View className="flex-row items-center gap-1">
            <Text className="mr-1 text-[10px] text-gray-500">
              {t('dashboard.cognitiveActivation.legend.less')}
            </Text>
            <View className="size-2.5 rounded-sm bg-gray-200 dark:bg-white/10" />
            <View className="size-2.5 rounded-sm bg-primary-200 dark:bg-primary-700/50" />
            <View className="size-2.5 rounded-sm bg-primary-400 dark:bg-primary-500/80" />
            <View className="size-2.5 rounded-sm bg-primary-600 dark:bg-primary-400" />
            <Text className="ml-1 text-[10px] text-gray-500">
              {t('dashboard.cognitiveActivation.legend.more')}
            </Text>
          </View>
        </View>

        {/* Custom Grid Heatmap */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-1"
        >
          {/* Day Labels Column */}
          <View className="mr-1 flex-col gap-1">
            {DAY_LABELS.map((label, index) => (
              <View key={index} className="h-6 w-6 items-center justify-center">
                <Text className="text-[10px] text-gray-500">{label}</Text>
              </View>
            ))}
          </View>

          {/* Grid Columns (each column is a week) */}
          {gridData.totalWeeks > 0 &&
            Array.from({ length: gridData.totalWeeks }).map((_, weekIndex) => (
              <View key={weekIndex} className="flex-col gap-1">
                {gridData.rows.map((row, dayIndex) => {
                  const cell = row[weekIndex];
                  if (cell === null) {
                    return (
                      <View
                        key={`${weekIndex}-${dayIndex}`}
                        className="h-6 w-6 rounded-sm bg-transparent"
                      />
                    );
                  }
                  return (
                    <View
                      key={`${weekIndex}-${dayIndex}`}
                      className={`h-6 w-6 rounded-sm ${getOpacityClass(cell.score)}`}
                    />
                  );
                })}
              </View>
            ))}
        </ScrollView>
      </View>
    </View>
  );
}
