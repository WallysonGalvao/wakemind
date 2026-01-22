/**
 * Achievements Screen
 * Main screen for viewing all achievements
 */

import React, { useState } from 'react';

import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScrollView, Text, View } from 'react-native';

import { AchievementGrid } from '../components/achievement-grid';
import { TierFilterTabs } from '../components/tier-filter-tabs';
import { useAchievements } from '../hooks/use-achievements';
import type { AchievementTier } from '../types/achievement.types';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const { achievements, loading } = useAchievements();
  const [tierFilter, setTierFilter] = useState<AchievementTier | null>(null);

  // Filter achievements by tier
  const filteredAchievements = achievements.filter((a) => {
    if (!tierFilter) return true;
    return a.achievement.tier === tierFilter;
  });

  // Calculate unlocked count
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <>
      <Stack.Screen
        options={{
          title: t('achievements.milestones', 'MILESTONES'),
          headerTitleStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 2.1, // 0.15em tracking
            textTransform: 'uppercase',
          },
        }}
      />

      <View className="flex-1 bg-white dark:bg-slate-950">
        {/* Sticky Header with Tier Filter */}
        <View className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
          {/* Unlocked Count */}
          <View className="mb-3">
            <Text className="text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t('achievements.unlocked', { count: unlockedCount, total: totalCount })}
            </Text>
          </View>

          {/* Tier Filter Tabs */}
          <TierFilterTabs selected={tierFilter} onChange={setTierFilter} />
        </View>

        {/* Achievement Grid */}
        <ScrollView className="flex-1 p-4 pb-24">
          <AchievementGrid achievements={filteredAchievements} loading={loading} />
        </ScrollView>
      </View>
    </>
  );
}
