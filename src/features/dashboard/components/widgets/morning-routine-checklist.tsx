import { useState } from 'react';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { db } from '@/db';
import { routineCompletions } from '@/db/schema';
import type { RoutineItemData, RoutineStats } from '@/features/dashboard/hooks/use-morning-routine';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface MorningRoutineChecklistProps {
  items: RoutineItemData[];
  stats: RoutineStats;
  onRefresh?: () => void;
}

export function MorningRoutineChecklist({ items, stats, onRefresh }: MorningRoutineChecklistProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');
  const [localItems, setLocalItems] = useState(items);

  // Sync local items with props
  if (items.length !== localItems.length || items.some((item, i) => item.id !== localItems[i].id)) {
    setLocalItems(items);
  }

  const toggleItem = async (itemId: string) => {
    const item = localItems.find((i) => i.id === itemId);
    if (!item) return;

    const today = dayjs().format('YYYY-MM-DD');

    if (item.isCompleted) {
      // Remove completion (optimistic update)
      setLocalItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isCompleted: false } : i))
      );

      // TODO: Delete from database
      // This requires a way to find the completion record ID
      // For now, we'll skip the actual deletion
    } else {
      // Add completion (optimistic update)
      setLocalItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, isCompleted: true } : i)));

      // Save to database
      try {
        await db.insert(routineCompletions).values({
          id: `${itemId}-${today}`,
          routineItemId: itemId,
          completedAt: dayjs().toISOString(),
          date: today,
          createdAt: dayjs().toISOString(),
        });
      } catch (error) {
        // Revert on error
        setLocalItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, isCompleted: false } : i))
        );
        console.error('Failed to save routine completion:', error);
      }
    }

    // Trigger refresh to update stats
    onRefresh?.();
  };

  const getProgressColor = () => {
    if (stats.todayProgress >= 80) return COLORS.green[500];
    if (stats.todayProgress >= 50) return COLORS.brandPrimary;
    if (stats.todayProgress >= 25) return COLORS.orange[500];
    return COLORS.red[500];
  };

  return (
    <View
      className="flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark"
      style={shadowStyle}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="checklist" size={24} color={COLORS.brandPrimary} />
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            {t('dashboard.routine.title')}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {stats.todayProgress}% {t('dashboard.routine.complete')}
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar progress={stats.todayProgress} color={getProgressColor()} height={8} />

      {/* Checklist Items */}
      <View className="gap-2">
        {localItems.map((item) => (
          <RoutineChecklistItem key={item.id} item={item} onToggle={toggleItem} />
        ))}
      </View>

      {/* Stats */}
      <View className="flex-row items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
        <View className="flex-row items-center gap-1">
          <MaterialSymbol name="calendar_month" size={16} color={COLORS.green[500]} />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.routine.weeklyAvg')}:{' '}
            <Text className="font-semibold">{stats.weeklyAverage}%</Text>
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <MaterialSymbol name="local_fire_department" size={16} color={COLORS.brandPrimary} />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.routine.streak')}:{' '}
            <Text className="font-semibold">{stats.currentStreak} days</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

interface RoutineChecklistItemProps {
  item: RoutineItemData;
  onToggle: (id: string) => void;
}

function RoutineChecklistItem({ item, onToggle }: RoutineChecklistItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onToggle(item.id)}
      className="flex-row items-center gap-3 rounded-lg bg-slate-50 p-3 active:bg-slate-100 dark:bg-slate-900 dark:active:bg-slate-800"
    >
      {/* Checkbox */}
      <View
        className={`h-6 w-6 items-center justify-center rounded border-2 ${
          item.isCompleted
            ? 'border-brand-primary bg-brand-primary'
            : 'border-slate-300 dark:border-slate-700'
        }`}
      >
        {item.isCompleted ? <MaterialSymbol name="check" size={16} color="#fff" /> : null}
      </View>

      {/* Icon */}
      <MaterialSymbol
        name={item.icon}
        size={20}
        color={item.isCompleted ? COLORS.brandPrimary : COLORS.green[500]}
      />

      {/* Title */}
      <Text
        className={`flex-1 text-sm ${
          item.isCompleted
            ? 'font-medium text-slate-900 line-through dark:text-white'
            : 'text-slate-900 dark:text-white'
        }`}
      >
        {item.title}
      </Text>
    </Pressable>
  );
}
