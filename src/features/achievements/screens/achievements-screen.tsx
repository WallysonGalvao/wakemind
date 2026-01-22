import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { AchievementCard } from '../components/achievement-card';
import { useAchievements } from '../hooks/use-achievements';
import type { AchievementState } from '../types/achievement.types';
import { AchievementTier } from '../types/achievement.types';

import type { IconButton } from '@/components/header';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import type { SegmentedControlItem } from '@/components/segmented-control';
import { SegmentedControl } from '@/components/segmented-control';

export default function AchievementsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { achievements, loading } = useAchievements();
  const [tierFilter, setTierFilter] = useState<AchievementTier | 'all'>('all');

  // Tier filter items
  const tierItems: SegmentedControlItem<AchievementTier | 'all'>[] = [
    { value: 'all', label: t('achievements.tiers.all') },
    { value: AchievementTier.BRONZE, label: t('achievements.tiers.bronze') },
    { value: AchievementTier.SILVER, label: t('achievements.tiers.silver') },
    { value: AchievementTier.GOLD, label: t('achievements.tiers.gold') },
    { value: AchievementTier.PLATINUM, label: t('achievements.tiers.platinum') },
  ];

  // Filter achievements by tier
  const filteredAchievements = achievements.filter((a) => {
    if (tierFilter === 'all') return true;
    return a.achievement.tier === tierFilter;
  });

  // Calculate unlocked count
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

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
    [router, t]
  );

  const keyExtractor = useCallback((item: AchievementState) => item.achievement.id, []);

  const renderItem = useCallback(
    ({ item }: { item: AchievementState }) => <AchievementCard achievement={item} />,
    []
  );

  const renderFooter = useCallback(
    () =>
      loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3FA9F5" />
        </View>
      ),
    [loading]
  );

  return (
    <>
      <View className="flex-1 bg-white dark:bg-slate-950">
        {/* Header */}
        <View style={{ paddingTop: insets.top }}>
          <Header title={t('achievements.milestones')} leftIcons={leftIcons} />
        </View>

        {/* Sticky Header with Tier Filter */}
        <View className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
          {/* Unlocked Count */}
          <View className="mb-3">
            <Text className="text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t('achievements.unlocked', { count: unlockedCount, total: totalCount })}
            </Text>
          </View>

          {/* Tier Filter */}
          <SegmentedControl
            items={tierItems}
            selectedValue={tierFilter}
            onValueChange={setTierFilter}
          />
        </View>

        <FlatList
          data={filteredAchievements}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerClassName="p-4 pb-24"
          columnWrapperClassName="gap-4"
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
        />
      </View>
    </>
  );
}
