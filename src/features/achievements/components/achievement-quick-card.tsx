/**
 * Achievement Quick Card
 * Dashboard widget showing achievement progress
 */

import React from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';


import { Text, TouchableOpacity, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';

interface AchievementQuickCardProps {
  unlockedCount: number;
  totalCount: number;
}

export function AchievementQuickCard({ unlockedCount, totalCount }: AchievementQuickCardProps) {
  const { t } = useTranslation();

  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => router.push('/achievements')}
      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 active:scale-[0.98]"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full items-center justify-center">
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
      <View className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <View
          className="h-full bg-cyan-500 dark:bg-cyan-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </TouchableOpacity>
  );
}
