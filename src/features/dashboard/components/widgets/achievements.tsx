/**
 * Achievements Widget
 * Dashboard widget showing achievement progress
 */

import React from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { useAchievements } from '@/features/achievements/hooks/use-achievements';

export function Achievements() {
  const { t } = useTranslation();
  const { achievements } = useAchievements();

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => router.push('/achievements')}
      className="rounded-2xl border border-slate-200 bg-white p-4 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 dark:bg-cyan-500/20">
            <MaterialSymbol name="emoji_events" size={24} color="#3FA9F5" />
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t('achievements.title')}
            </Text>
            <Text className="text-xs text-slate-600 dark:text-slate-400">
              {t('achievements.unlocked', { count: unlockedCount, total: totalCount })}
            </Text>
          </View>
        </View>
        <MaterialSymbol name="chevron_right" size={20} color="#94A3B8" />
      </View>

      {/* Progress Bar */}
      <View className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <View
          className="h-full rounded-full bg-cyan-500 dark:bg-cyan-600"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </TouchableOpacity>
  );
}
