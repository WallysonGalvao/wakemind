/**
 * Performance Summary Hero Section
 * Displays success icon, badge, title, and time comparison
 */

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface PerformanceHeroProps {
  targetTime: string;
  actualTime: string;
}

export function PerformanceHero({ targetTime, actualTime }: PerformanceHeroProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');
  const shadowStyleLg = useShadowStyle('lg');

  return (
    <View className="mb-8 mt-6 flex-col items-center justify-center">
      {/* Icon with background circle */}
      <View className="relative mb-5">
        {/* Glow effect */}
        <View className="absolute inset-0 scale-150 rounded-full bg-green-400/20 blur-2xl" />
        {/* Green circle background with check icon */}
        <View
          style={shadowStyleLg}
          className="relative z-10 h-20 w-20 items-center justify-center rounded-full bg-green-400"
        >
          <MaterialSymbol name="check" size={48} className="text-white" />
        </View>
      </View>

      {/* Badge */}
      <View className="my-4 flex-row items-center gap-2">
        <View className="flex h-8 flex-row items-center justify-center gap-x-2 rounded-full border border-green-400/20 bg-green-400/10 px-4">
          <MaterialSymbol name="alarm_on" size={20} className="text-green-400" />
          <Text className="text-xs font-bold uppercase tracking-wide text-green-400">
            {t('performance.wakeUpSuccess')}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text className="mb-4 text-center text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
        {t('performance.missionAccomplished')}
      </Text>

      {/* Time comparison */}
      <View
        style={shadowStyle}
        className="flex-row items-center justify-center gap-4 rounded-full border border-slate-200 bg-white px-6 py-2 dark:border-white/5 dark:bg-surface-dark"
      >
        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('performance.target')}:{' '}
          <Text className="font-bold text-slate-900 dark:text-white">{targetTime}</Text>
        </Text>
        <View className="h-4 w-px bg-slate-200 dark:bg-white/10" />
        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('performance.actual')}: <Text className="font-bold text-green-500">{actualTime}</Text>
        </Text>
      </View>
    </View>
  );
}
