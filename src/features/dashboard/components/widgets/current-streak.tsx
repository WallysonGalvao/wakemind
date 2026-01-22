import React from 'react';

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { AnimatedCounter } from '@/components/animated-counter';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface CurrentStreakProps {
  streak: number;
}

export function CurrentStreak({ streak }: CurrentStreakProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  return (
    <View
      className="h-32 flex-1 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-transparent dark:bg-surface-dark"
      style={shadowStyle}
    >
      <View className="flex-row items-start justify-between">
        <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('dashboard.currentStreak.title')}
        </Text>
        <MaterialSymbol name="local_fire_department" size={20} color={COLORS.brandPrimary} />
      </View>
      <View>
        <AnimatedCounter
          value={streak}
          className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white"
        />
        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.currentStreak.daysOnTarget')}
        </Text>
      </View>
    </View>
  );
}
