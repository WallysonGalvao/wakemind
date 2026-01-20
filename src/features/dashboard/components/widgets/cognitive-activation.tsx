import React, { useMemo } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface CognitiveActivationProps {
  data: Array<{ date: string; count: number; avgScore: number }>;
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

// Day labels starting from Monday (M = Monday, T = Tuesday, etc.)
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function CognitiveActivation({ data }: CognitiveActivationProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const shadowStyle = useShadowStyle('sm');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleInfoPress = () => {
    router.push('/dashboard/modals/cognitive-activation-info');
  };

  // Get current month name
  const currentMonthName = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat(t('common.locale'), { month: 'long' }).format(now);
  }, [t]);

  // Create a map of date -> score for quick lookup
  const scoreMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      map.set(d.date, d.avgScore);
    });
    return map;
  }, [data]);

  // Build the grid for current month only
  const monthGrid = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get first day of month and total days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    // Convert to Monday-based week (Monday = 0, Sunday = 6)
    const mondayBasedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Build array of all days in month with their scores
    const days: Array<{ date: string; score: number; dayOfWeek: number } | null> = [];

    // Add empty cells for days before month starts (Monday-based)
    for (let i = 0; i < mondayBasedStart; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const score = scoreMap.get(dateStr) || 0;
      const dayOfWeek = date.getDay();

      days.push({ date: dateStr, score, dayOfWeek });
    }

    return days;
  }, [scoreMap]);

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
      {/* <View className="flex-1 bg-background-light dark:bg-background-dark"></View> */}
      <View
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-transparent dark:bg-surface-dark"
        style={shadowStyle}
      >
        {/* Stats Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-medium capitalize text-gray-400">{currentMonthName}</Text>
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
        <View className="flex-col items-center gap-1 ">
          {/* Day Labels - Horizontal */}
          <View className="flex-row gap-0.5">
            {DAY_LABELS.map((label, index) => (
              <View key={index} className="h-8 w-8 items-center justify-center">
                <Text className="text-[10px] text-gray-500">{label}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid - Horizontal rows */}
          <View className="flex-col gap-0.5">
            {/* Split days into weeks (rows of 7) */}
            {Array.from({ length: Math.ceil(monthGrid.length / 7) }).map((_, weekIndex) => (
              <View key={weekIndex} className="flex-row gap-0.5">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const cellIndex = weekIndex * 7 + dayIndex;
                  const cell = monthGrid[cellIndex];

                  if (!cell) {
                    return (
                      <View
                        key={`${weekIndex}-${dayIndex}`}
                        className="h-8 w-8 rounded-md bg-transparent"
                      />
                    );
                  }

                  // Check if this is today
                  const today = new Date().toISOString().split('T')[0];
                  const isToday = cell.date === today;

                  if (isToday) {
                    return (
                      <View
                        key={`${weekIndex}-${dayIndex}`}
                        className="h-8 w-8 items-center justify-center rounded-md border-2 border-brand-primary bg-transparent"
                      >
                        <View className={`h-2 w-2 rounded-full ${getOpacityClass(cell.score)}`} />
                      </View>
                    );
                  }

                  return (
                    <View
                      key={`${weekIndex}-${dayIndex}`}
                      className={`h-8 w-8 rounded-md ${getOpacityClass(cell.score)}`}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
