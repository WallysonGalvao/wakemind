/**
 * Achievement History Screen
 * Displays unlocked achievements grouped by time period
 */

import React, { useCallback, useMemo } from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SectionListData, SectionListRenderItem } from 'react-native';
import { SectionList, Text, View } from 'react-native';

import { AchievementCard } from '../components/achievement-card';
import { useAchievements } from '../hooks/use-achievements';
import type { AchievementState } from '../types/achievement.types';
import { groupAchievementsByPeriod } from '../utils/achievement-history-grouper';

import type { IconButton } from '@/components/header';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';

interface HistorySection {
  period: 'thisWeek' | 'lastMonth' | 'archive';
  totalMP: number;
  data: AchievementState[][];
}

export default function AchievementHistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { achievements, loading } = useAchievements();

  // Group achievements by period and prepare for SectionList
  const sections = useMemo(() => {
    const groups = groupAchievementsByPeriod(achievements);

    // Transform groups into SectionList format with 2-column rows
    return groups.map((group) => {
      const rows: AchievementState[][] = [];
      for (let i = 0; i < group.achievements.length; i += 2) {
        rows.push(group.achievements.slice(i, i + 2));
      }

      return {
        period: group.period,
        totalMP: group.totalMP,
        data: rows,
      };
    });
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

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<AchievementState[], HistorySection> }) => {
      const periodTitle = t(`achievements.history.${section.period}`);

      return (
        <View className="mb-4 flex-row items-center justify-between px-5 pt-4">
          <Text className="text-xs font-bold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">
            {periodTitle}
          </Text>
          <View className="rounded-md bg-blue-500/10 px-2 py-1 dark:bg-blue-500/20">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400">
              {t('achievements.history.totalEarned', { mp: section.totalMP })}
            </Text>
          </View>
        </View>
      );
    },
    [t]
  );

  const renderItem: SectionListRenderItem<AchievementState[], HistorySection> = useCallback(
    ({ item: row }) => {
      return (
        <View className="mb-3 flex-row gap-3 px-4">
          {row.map((achievement) => (
            <View key={achievement.achievement.id} className="flex-1">
              <AchievementCard achievement={achievement} />
            </View>
          ))}
          {row.length === 1 && <View className="flex-1" />}
        </View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item: AchievementState[], index: number) => `row-${index}`, []);

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
        <Header title={t('achievements.history.title')} leftIcons={leftIcons} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-600 dark:text-slate-400">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <View style={{ paddingTop: insets.top }}>
        <Header title={t('achievements.history.title')} leftIcons={leftIcons} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerClassName="pb-28"
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
