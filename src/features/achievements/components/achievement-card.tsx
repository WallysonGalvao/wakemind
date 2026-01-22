/**
 * Achievement Card Component
 * Displays individual achievement with tier-specific styling
 */

import React from 'react';

import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity, View } from 'react-native';

import type { AchievementState } from '../types/achievement.types';

import { MaterialSymbol } from '@/components/material-symbol';

interface AchievementCardProps {
  achievement: AchievementState;
  onPress?: () => void;
}

export function AchievementCard({ achievement, onPress }: AchievementCardProps) {
  const { t } = useTranslation();
  const { achievement: def, isUnlocked, progress, target } = achievement;

  // Tier-specific colors
  const getTierColors = () => {
    switch (def.tier) {
      case 'bronze':
        return {
          iconBg: 'bg-[#CD7F32]/10',
          iconColor: '#CD7F32',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
        };
      case 'silver':
        return {
          iconBg: 'bg-gray-400/20',
          iconColor: '#9CA3AF',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
        };
      case 'gold':
        return {
          iconBg: 'bg-[#FFD700]/10',
          iconColor: '#CA8A04',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
        };
      case 'platinum':
        return {
          iconBg: 'bg-gradient-to-br from-cyan-500/5 to-transparent',
          iconColor: '#3FA9F5',
          badgeBg: 'bg-cyan-500 dark:bg-cyan-600',
        };
      default:
        return {
          iconBg: 'bg-slate-100 dark:bg-slate-800',
          iconColor: '#64748B',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
        };
    }
  };

  const colors = getTierColors();
  const isPlatinum = def.tier === 'platinum';
  const isLocked = !isUnlocked;

  // Display name and description
  const achievementName = t(`achievements.${def.id}.name`);
  const achievementDesc = def.isSecret && isLocked
    ? t(`achievements.${def.id}.secretDescription`, '???')
    : t(`achievements.${def.id}.description`);

  return (
    <TouchableOpacity accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      className={`
        group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900
        border shadow-sm overflow-hidden transition-all duration-300
        ${isPlatinum && isUnlocked ? 'border-cyan-500/40 shadow-cyan-500/20' : 'border-slate-200 dark:border-slate-800'}
        ${isLocked ? 'opacity-60' : 'opacity-100'}
        active:scale-[0.98]
      `}
    >
      {/* Platinum top accent */}
      {isPlatinum && isUnlocked ? <View className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" /> : null}

      {/* Badge (MP or Progress) */}
      <View className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-full ${isPlatinum && isUnlocked ? colors.badgeBg : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
        <Text className={`text-[10px] font-bold ${isPlatinum && isUnlocked ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
          {isLocked && progress > 0 ? `${progress}/${target}` : '50 MP'}
        </Text>
      </View>

      {/* Icon Area */}
      <View className={`h-28 p-4 flex items-center justify-center ${colors.iconBg}`}>
        <View className={`w-12 h-12 rounded-full flex items-center justify-center ${isPlatinum && isUnlocked ? 'bg-gradient-to-tr from-white to-cyan-500/20 border border-cyan-500/20' : colors.iconBg}`}>
          <MaterialSymbol
            name={def.icon}
            size={32}
            color={isLocked ? '#94A3B8' : colors.iconColor}
            weight={300}
          />
        </View>
      </View>

      {/* Content Area */}
      <View className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50">
        <Text
          className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate"
          numberOfLines={1}
        >
          {achievementName}
        </Text>
        <Text
          className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate"
          numberOfLines={1}
        >
          {achievementDesc}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
