import { useTranslation } from 'react-i18next';

import { Text, useColorScheme, View } from 'react-native';

import type { AchievementTier } from '../types/achievement.types';

import { MaterialSymbol } from '@/components/material-symbol';

interface MPBalanceCardProps {
  currentMP: number;
  lifetimeMP: number;
  currentTier: AchievementTier;
  nextTier: AchievementTier | null;
  progressPercentage: number;
  mpToUpgrade: number;
}

export function MPBalanceCard({
  currentMP,
  lifetimeMP,
  currentTier,
  nextTier,
  progressPercentage,
  mpToUpgrade,
}: MPBalanceCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const colors = {
    decorativeIcon: isDark ? '#3FA9F5' : '#0F172A',
    balanceText: isDark ? '#3FA9F5' : '#334155',
    balanceNumber: isDark ? '#3FA9F5' : '#0F172A',
    balanceSuffix: isDark ? 'rgba(63, 169, 245, 0.6)' : '#64748B',
    lifetimeText: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B',
    progressText: isDark ? '#FFFFFF' : '#0F172A',
    progressLabel: isDark ? 'rgba(255, 255, 255, 0.4)' : '#94A3B8',
  };

  return (
    <View className="flex flex-col gap-4 px-4 pt-4">
      {/* Balance Card */}
      <View className="relative overflow-hidden rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-sm dark:border-[#3FA9F5]/30 dark:bg-gradient-to-br dark:from-[#1a2e3b] dark:to-[#2E2E2E] dark:shadow-[0_0_15px_rgba(63,169,245,0.15)]">
        {/* Decorative Icon */}
        <View className="absolute right-4 top-4 opacity-[0.08] dark:opacity-10">
          <MaterialSymbol name="bolt" size={120} color={colors.decorativeIcon} />
        </View>

        {/* Content */}
        <View className="relative z-10 flex flex-col items-start gap-1">
          <Text
            className="text-sm font-medium uppercase tracking-widest opacity-90"
            style={{ color: colors.balanceText }}
          >
            {t('achievements.currentBalance')}
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text
              className="text-5xl font-bold tracking-tight"
              style={{ color: colors.balanceNumber }}
            >
              {currentMP.toLocaleString()}
            </Text>
            <Text className="text-lg font-bold" style={{ color: colors.balanceSuffix }}>
              MP
            </Text>
          </View>
          <Text className="font-mono mt-2 text-xs" style={{ color: colors.lifetimeText }}>
            {t('achievements.lifetimeTotal', { total: lifetimeMP.toLocaleString() })}
          </Text>
        </View>
      </View>

      {/* Progression */}
      <View className="flex flex-col gap-2">
        <View className="flex-row items-end justify-between">
          <Text
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: colors.progressText }}
          >
            {nextTier ? (
              <>
                {t('achievements.nextRank', { tier: '' })}{' '}
                <Text className="text-primary-500">
                  {t(`achievements.tiers.${nextTier}`).toUpperCase()}
                </Text>
              </>
            ) : (
              <>
                {t('achievements.tiers.platinum').toUpperCase()}{' '}
                <Text className="text-primary-500">ACHIEVED</Text>
              </>
            )}
          </Text>
          <Text className="font-mono text-xs font-medium text-primary-500">
            {Math.round(progressPercentage)}%
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#2E2E2E]">
          <View
            className="absolute left-0 top-0 h-full rounded-full bg-primary-500 shadow-[0_0_10px_rgba(168,61,245,0.4)] dark:bg-gradient-to-r dark:from-primary-500/60 dark:to-primary-500 dark:shadow-[0_0_10px_rgba(168,61,245,0.6)]"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </View>

        {/* Labels */}
        <View className="flex-row justify-between">
          <Text
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: colors.progressLabel }}
          >
            {t(`achievements.tiers.${currentTier}`)} {currentTier === 'gold' ? 'III' : ''}
          </Text>
          {nextTier ? (
            <Text
              className="font-mono text-[10px] uppercase tracking-wider"
              style={{ color: colors.progressLabel }}
            >
              {t('achievements.mpToUpgrade', { mp: mpToUpgrade })}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
