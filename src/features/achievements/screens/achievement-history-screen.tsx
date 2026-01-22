/**
 * Achievement History Screen
 * Displays unlocked achievements grouped by time period
 */

import React, { useCallback, useMemo } from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, Text, View } from 'react-native';

import { AchievementCard } from '../components/achievement-card';
import { useAchievements } from '../hooks/use-achievements';
import type { AchievementState } from '../types/achievement.types';
import type { AchievementHistoryGroup } from '../utils/achievement-history-grouper';
import { groupAchievementsByPeriod } from '../utils/achievement-history-grouper';

import type { IconButton } from '@/components/header';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';

export default function AchievementHistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { achievements, loading } = useAchievements();

  // Group achievements by period
  const groups = useMemo(() => {
    return groupAchievementsByPeriod(achievements);
  }, [achievements]);

  const leftIcons = useMemo(
    () => [
      {
        icon: (
          <MaterialSymbol name="arrow_back" size={24} className="text-slate-900 dark:text-white" />
        ),
        onPress: () => router.back(),
        accessibilityLabel: t('common.back'),
      } as IconButton,
    ],
    [t]
  );

  const renderPeriodHeader = useCallback(
    (group: AchievementHistoryGroup) => {
      const periodTitle = t(`achievements.history.${group.period}`);

      return (
        <View className="mb-4 flex-row items-center justify-between px-1">
          <Text className="text-xs font-bold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">
            {periodTitle}
          </Text>
          <View className="rounded-md bg-blue-500/10 px-2 py-1 dark:bg-blue-500/20">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400">
              {t('achievements.history.totalEarned', { mp: group.totalMP })}
            </Text>
          </View>
        </View>
      );
    },
    [t]
  );

  const renderAchievementGrid = useCallback((items: AchievementState[]) => {
    return (
      <View className="mb-8 flex-row flex-wrap gap-3">
        {items.map((achievement) => (
          <View key={achievement.achievement.id} className="w-[48%]">
            <AchievementCard achievement={achievement} onPress={() => {}} />
          </View>
        ))}
      </View>
    );
  }, []);

  const renderEmptyState = useCallback(() => {
    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <MaterialSymbol name="emoji_events" size={40} color="#94A3B8" />
        </View>
        <Text className="mb-2 text-center text-lg font-bold text-slate-900 dark:text-slate-100">
          {t('achievements.history.empty')}
        </Text>
        <Text className="text-center text-sm text-slate-600 dark:text-slate-400">
          {t('achievements.history.emptyDescription')}
        </Text>
      </View>
    );
  }, [t]);

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-950">
        <Header title={t('achievements.history.title')} leftIcons={leftIcons} rightIcons={[]} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-600 dark:text-slate-400">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <View style={{ paddingTop: insets.top }}>
        <Header title={t('achievements.history.title')} leftIcons={leftIcons} rightIcons={[]} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pt-4 pb-28">
        {groups.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {groups.map((group) => (
              <View key={group.period} className="mb-6">
                {renderPeriodHeader(group)}
                {renderAchievementGrid(group.achievements)}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
