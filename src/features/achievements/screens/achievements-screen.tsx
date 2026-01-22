import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { AchievementCard } from '../components/achievement-card';
import { MPBalanceCard } from '../components/mp-balance-card';
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
  const tierItems: SegmentedControlItem<AchievementTier | 'all'>[] = useMemo(() => {
    return [
      { value: 'all', label: t('achievements.tiers.all') },
      { value: AchievementTier.BRONZE, label: t('achievements.tiers.bronze') },
      { value: AchievementTier.SILVER, label: t('achievements.tiers.silver') },
      { value: AchievementTier.GOLD, label: t('achievements.tiers.gold') },
      { value: AchievementTier.PLATINUM, label: t('achievements.tiers.platinum') },
    ];
  }, [t]);

  // Filter achievements by tier
  const filteredAchievements = achievements.filter((a) => {
    if (tierFilter === 'all') return true;
    return a.achievement.tier === tierFilter;
  });

  // Calculate unlocked count
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

  // Calculate MP balance (50 MP per unlocked achievement)
  const currentMP = unlockedCount * 50;
  const lifetimeMP = totalCount * 50; // Simplified: could be based on historical data

  // Calculate next tier progression
  const tierThresholds = {
    [AchievementTier.BRONZE]: 0,
    [AchievementTier.SILVER]: 250,
    [AchievementTier.GOLD]: 750,
    [AchievementTier.PLATINUM]: 2000,
  };

  const getCurrentTier = () => {
    if (currentMP >= tierThresholds[AchievementTier.PLATINUM]) return AchievementTier.PLATINUM;
    if (currentMP >= tierThresholds[AchievementTier.GOLD]) return AchievementTier.GOLD;
    if (currentMP >= tierThresholds[AchievementTier.SILVER]) return AchievementTier.SILVER;
    return AchievementTier.BRONZE;
  };

  const getNextTier = () => {
    const current = getCurrentTier();
    if (current === AchievementTier.PLATINUM) return null;
    if (current === AchievementTier.GOLD) return AchievementTier.PLATINUM;
    if (current === AchievementTier.SILVER) return AchievementTier.GOLD;
    return AchievementTier.SILVER;
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const nextTierThreshold = nextTier ? tierThresholds[nextTier] : tierThresholds.platinum;
  const mpToUpgrade = nextTier ? nextTierThreshold - currentMP : 0;
  const progressPercentage = nextTier
    ? ((currentMP - tierThresholds[currentTier]) /
        (nextTierThreshold - tierThresholds[currentTier])) *
      100
    : 100;

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

  const rightIcons = useMemo(
    () => [
      {
        label: (
          <Text className="text-sm font-semibold text-primary-500">
            {t('achievements.history')}
          </Text>
        ),
        onPress: () => {
          // TODO: Navigate to achievements history screen
          console.log('Navigate to history');
        },
        accessibilityLabel: t('achievements.history'),
      } as IconButton,
    ],
    [t]
  );

  const keyExtractor = useCallback((item: AchievementState) => item.achievement.id, []);

  const renderHeader = useCallback(
    () => (
      <View className=" pb-6">
        {/* Tier Filter */}
        <SegmentedControl
          items={tierItems}
          selectedValue={tierFilter}
          onValueChange={setTierFilter}
        />

        <View>
          <Text className="text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t('achievements.unlocked', { count: unlockedCount, total: totalCount })}
          </Text>
        </View>
      </View>
    ),
    [t, tierFilter, tierItems, totalCount, unlockedCount]
  );

  const renderItem = useCallback(
    ({ item }: { item: AchievementState }) => (
      <View className="mb-4 flex-1">
        <AchievementCard achievement={item} />
      </View>
    ),
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
          <Header title={t('achievements.title')} leftIcons={leftIcons} rightIcons={rightIcons} />
        </View>

        {/* MP Balance Card */}
        <MPBalanceCard
          currentMP={currentMP}
          lifetimeMP={lifetimeMP}
          currentTier={currentTier}
          nextTier={nextTier}
          progressPercentage={progressPercentage}
          mpToUpgrade={mpToUpgrade}
        />

        <FlatList
          numColumns={2}
          data={filteredAchievements}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          contentContainerClassName="p-4 pb-24"
          columnWrapperClassName="gap-4"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}
