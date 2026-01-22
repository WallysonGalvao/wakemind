/**
 * Achievement Card Component
 * Displays individual achievement with tier-specific styling
 */

import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity, View } from 'react-native';

import type { AchievementState } from '../types/achievement.types';

import { MaterialSymbol } from '@/components/material-symbol';
import { useShadowStyle } from '@/hooks/use-shadow-style';

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
          shadowColor: '#CD7F32',
          borderColor: 'rgba(205, 127, 50, 0.3)',
        };
      case 'silver':
        return {
          iconBg: 'bg-gray-400/20',
          iconColor: '#9CA3AF',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
          shadowColor: '#9CA3AF',
          borderColor: 'rgba(156, 163, 175, 0.3)',
        };
      case 'gold':
        return {
          iconBg: 'bg-[#FFD700]/10',
          iconColor: '#CA8A04',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
          shadowColor: '#CA8A04',
          borderColor: 'rgba(202, 138, 4, 0.3)',
        };
      case 'platinum':
        return {
          iconBg: 'bg-gradient-to-br from-blue-500/5 to-transparent',
          iconColor: '#3B82F6',
          badgeBg: 'bg-blue-500 dark:bg-blue-600',
          shadowColor: '#3B82F6',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        };
      default:
        return {
          iconBg: 'bg-slate-100 dark:bg-slate-800',
          iconColor: '#64748B',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
          shadowColor: '#64748B',
          borderColor: 'rgba(100, 116, 139, 0.2)',
        };
    }
  };

  const colors = getTierColors();
  const shadowStyle = useShadowStyle('md', colors.shadowColor);
  const isPlatinum = def.tier === 'platinum';
  const isLocked = !isUnlocked;

  // Display name and description
  const achievementName = t(`achievements.${def.id}.name`);
  const achievementDesc =
    def.isSecret && isLocked
      ? t(`achievements.${def.id}.secretDescription`, '???')
      : t(`achievements.${def.id}.description`);

  return (
    <View style={isLocked ? undefined : shadowStyle}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onPress}
        disabled={!onPress}
        style={{
          borderColor: isLocked ? 'rgba(100, 116, 139, 0.2)' : colors.borderColor,
        }}
        className={`
        group relative flex flex-col overflow-hidden rounded-2xl border
        bg-white shadow-sm transition-all duration-300 dark:bg-slate-900
        ${isLocked ? 'opacity-60' : 'opacity-100'}
        active:scale-[0.98]
      `}
      >
        {/* Platinum top accent */}
        {isPlatinum && isUnlocked ? (
          <View className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        ) : null}

        {/* Badge (MP or Progress) */}
        <View
          className={`absolute right-3 top-3 z-10 rounded-full px-2 py-1 ${isPlatinum && isUnlocked ? colors.badgeBg : 'border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'}`}
        >
          <Text
            className={`text-[10px] font-bold ${isPlatinum && isUnlocked ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}
          >
            {isLocked && progress > 0 ? `${progress}/${target}` : '50 MP'}
          </Text>
        </View>

        {/* Icon Area */}
        <View className={`flex h-28 items-center justify-center p-4 ${colors.iconBg}`}>
          <View
            className={`flex h-12 w-12 items-center justify-center rounded-full ${isPlatinum && isUnlocked ? 'border border-blue-500/20 bg-gradient-to-tr from-white to-blue-500/20' : colors.iconBg}`}
          >
            <MaterialSymbol
              name={def.icon}
              size={32}
              color={isLocked ? '#94A3B8' : colors.iconColor}
            />
          </View>
        </View>

        {/* Content Area */}
        <View className="border-t border-slate-200/50 bg-white p-3 dark:border-slate-800/50 dark:bg-slate-900">
          <Text
            className="truncate text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100"
            numberOfLines={1}
          >
            {achievementName}
          </Text>
          <Text
            className="mt-0.5 truncate text-[10px] text-slate-600 dark:text-slate-400"
            numberOfLines={1}
          >
            {achievementDesc}
          </Text>

          {/* Progress Bar - Only show if locked and has progress */}
          {isLocked && progress > 0 ? (
            <View className="mt-2">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                  {t('achievements.progress', { current: progress, target })}
                </Text>
                <Text className="text-[10px] font-bold text-slate-900 dark:text-slate-100">
                  {Math.round((progress / target) * 100)}%
                </Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <View
                  className="h-full rounded-full bg-blue-500 dark:bg-blue-600"
                  style={{ width: `${(progress / target) * 100}%` }}
                />
              </View>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}
