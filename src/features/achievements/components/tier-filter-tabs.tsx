/**
 * Tier Filter Tabs Component
 * Segmented control for filtering achievements by tier
 */

import React from 'react';

import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity, View } from 'react-native';

import type { AchievementTier } from '../types/achievement.types';

interface TierFilterTabsProps {
  selected: AchievementTier | null;
  onChange: (tier: AchievementTier | null) => void;
}

const TIERS: (AchievementTier | null)[] = ['bronze', 'silver', 'gold', 'platinum'];

export function TierFilterTabs({ selected, onChange }: TierFilterTabsProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row p-1 bg-slate-100 dark:bg-slate-900 rounded-xl gap-1">
      {TIERS.map((tier) => {
        const isSelected = selected === tier;
        const label = tier ? t(`achievements.tiers.${tier}`) : 'All';

        return (
          <TouchableOpacity accessibilityRole="button"
            key={tier || 'all'}
            onPress={() => onChange(tier)}
            className={`
              flex-1 py-1.5 rounded-lg text-center transition-all
              ${isSelected ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'}
            `}
          >
            <Text
              className={`
                text-[10px] font-bold uppercase tracking-wide text-center
                ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}
              `}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
