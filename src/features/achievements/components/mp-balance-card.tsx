import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import type { AchievementTier } from '../types/achievement.types';

import { MaterialSymbol } from '@/components/material-symbol';
import { useShadowStyle } from '@/hooks/use-shadow-style';

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
  const shadowStyle = useShadowStyle('md', '#3FA9F5');

  return (
    <View className="flex flex-col gap-4 px-4 pt-4">
      {/* Balance Card */}
      <View style={shadowStyle}>
        <View className="relative overflow-hidden rounded-2xl border border-primary-500 bg-white p-5 shadow-lg shadow-primary-500/20 dark:bg-[#1a2233]">
          {/* Decorative Icon */}
          <View className="absolute right-4 top-1.5 opacity-[0.08] dark:opacity-10">
            <MaterialSymbol
              name="bolt"
              size={120}
              className="text-slate-900 dark:text-sky-500/50"
            />
          </View>

          {/* Content */}
          <View className="relative z-10 flex flex-col items-start gap-1">
            <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary-500">
              {t('achievements.currentBalance')}
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                {currentMP.toLocaleString()}
              </Text>
              <Text className="text-lg font-bold text-gray-600 dark:text-gray-400">MP</Text>
            </View>
            <View className="my-4 h-px bg-gray-200 dark:bg-gray-800" />
            <Text className="font-mono text-xs text-gray-500 dark:text-gray-400">
              {t('achievements.lifetimeTotal', { total: lifetimeMP.toLocaleString() })}
            </Text>
          </View>
        </View>
      </View>

      {/* Progression */}
      <View className="flex flex-col gap-2">
        <View className="flex-row items-end justify-between">
          <Text className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
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
                <Text className="text-primary-500">{t('achievements.achieved').toUpperCase()}</Text>
              </>
            )}
          </Text>
          <Text className="font-mono text-xs font-medium text-primary-500">
            {Math.round(progressPercentage)}%
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <View
            className="absolute left-0 top-0 h-full rounded-full bg-primary-500 shadow-primary-500/40 dark:bg-gradient-to-r dark:from-primary-500/60 dark:to-primary-500 dark:shadow-primary-500/60"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </View>

        {/* Labels */}
        <View className="flex-row justify-between">
          <Text className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">
            {t(`achievements.tiers.${currentTier}`)} {currentTier === 'gold' ? 'III' : ''}
          </Text>
          {nextTier ? (
            <Text className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">
              {t('achievements.mpToUpgrade', { mp: mpToUpgrade })}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
