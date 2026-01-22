import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { AnimatedCounter } from '@/components/animated-counter';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface AvgLatencyProps {
  latencyMinutes: number;
}

export function AvgLatency({ latencyMinutes }: AvgLatencyProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  // Debug log
  if (__DEV__) {
    console.log('[AvgLatency] Rendering with latencyMinutes:', latencyMinutes);
  }

  // Convert to seconds if less than 1 minute for better precision
  const { value, unit } = useMemo(() => {
    if (latencyMinutes < 1) {
      const seconds = Math.round(latencyMinutes * 60);
      return { value: seconds, unit: 's' };
    }
    return { value: latencyMinutes, unit: 'm' };
  }, [latencyMinutes]);

  return (
    <View
      className="h-32 flex-1 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark"
      style={shadowStyle}
    >
      <View className="flex-row items-start justify-between">
        <Text className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('dashboard.avgLatency.title')}
        </Text>
        <MaterialSymbol name="timer" size={20} color={COLORS.gray[400]} />
      </View>
      <View>
        <View className="flex-row items-baseline">
          <AnimatedCounter
            value={value}
            className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white"
          />
          <Text className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {unit}
          </Text>
        </View>
        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.avgLatency.timeToStandUp')}
        </Text>
      </View>
    </View>
  );
}
