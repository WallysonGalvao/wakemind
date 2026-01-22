import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import type { AchievementTier } from '../types/achievement.types';

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
  nextTier,
  progressPercentage,
  mpToUpgrade,
}: MPBalanceCardProps) {
  const { t } = useTranslation();

  return (
    <View className="mx-4 mt-4 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-5">
      {/* Current Balance */}
      <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
        {t('achievements.currentBalance')}
      </Text>
      <View className="mb-3 flex-row items-end">
        <Text className="text-5xl font-bold text-slate-900 dark:text-slate-100">
          {currentMP.toLocaleString()}
        </Text>
        <Text className="mb-2 ml-2 text-xl font-semibold text-slate-600 dark:text-slate-400">
          MP
        </Text>
      </View>

      {/* Lifetime Total */}
      <Text className="mb-4 text-xs text-slate-600 dark:text-slate-400">
        {t('achievements.lifetimeTotal', { total: lifetimeMP.toLocaleString() })}
      </Text>

      {/* Next Rank Progress */}
      {nextTier ? (
        <>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {t('achievements.nextRank', {
                tier: t(`achievements.tiers.${nextTier}`).toUpperCase(),
              })}
            </Text>
            <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {Math.round(progressPercentage)}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <View
              className="h-full rounded-full bg-blue-500 dark:bg-blue-600"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </View>

          {/* MP to Upgrade */}
          <Text className="text-right text-[10px] uppercase tracking-wide text-slate-600 dark:text-slate-400">
            {t('achievements.mpToUpgrade', { mp: mpToUpgrade })}
          </Text>
        </>
      ) : (
        <View className="items-center py-2">
          <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
            🏆 {t('achievements.tiers.platinum').toUpperCase()} RANK ACHIEVED
          </Text>
        </View>
      )}
    </View>
  );
}
