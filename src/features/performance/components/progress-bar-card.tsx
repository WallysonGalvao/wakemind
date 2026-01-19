import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { View } from 'react-native';

import { AnimatedCounter } from '@/components/animated-counter';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import { cn } from '@/utils/cn';

interface ProgressBarCardProps {
  icon: string;
  title: string;
  value: number; // 0-100
  displayValue?: string;
  previousValue?: number;
  className?: string;
}

export function ProgressBarCard({
  icon,
  title,
  value,
  displayValue,
  previousValue,
  className,
}: ProgressBarCardProps) {
  const { t } = useTranslation();
  const isTrendingUp = previousValue !== undefined && value > previousValue;
  const isTrendingDown = previousValue !== undefined && value < previousValue;
  const shadowStyle = useShadowStyle('sm');

  // Animated progress bar width
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(Math.min(value, 100), {
      duration: 1000,
    });
  }, [value, progressWidth]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const getTrendText = () => {
    if (isTrendingUp) return t('performance.trendingUp');
    if (isTrendingDown) return t('performance.trendingDown');
    return t('performance.stable');
  };

  return (
    <View
      style={shadowStyle}
      className={cn(
        'rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/5 dark:bg-surface-dark',
        className
      )}
    >
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="rounded-lg border border-slate-100 bg-slate-50 p-1.5 dark:border-white/5 dark:bg-white/5">
            <MaterialSymbol name={icon} size={20} className="text-slate-400 dark:text-slate-400" />
          </View>
          <Text className="text-sm font-bold text-slate-900 dark:text-white">{title}</Text>
        </View>
        {displayValue ? (
          <Text className="text-lg font-bold text-slate-900 dark:text-white">{displayValue}</Text>
        ) : (
          <View className="flex-row">
            <AnimatedCounter
              value={value}
              duration={1000}
              className="text-lg font-bold text-slate-900 dark:text-white"
            />
            <Text className="text-lg font-bold text-slate-900 dark:text-white">%</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <Animated.View
          className="absolute left-0 top-0 h-full rounded-full bg-primary-500 shadow-[0_2px_10px_rgba(19,91,236,0.3)]"
          style={animatedProgressStyle}
        />
      </View>

      {/* Footer with trend */}
      {previousValue !== undefined && (
        <View className="mt-3 flex-row justify-between">
          <Text className="text-[11px] font-semibold tracking-wide text-slate-400">
            {t('performance.lastWeek')}: {previousValue}%
          </Text>
          <View className="flex-row items-center gap-1">
            {isTrendingUp ? (
              <MaterialSymbol name="trending_up" size={14} className="text-green-500" />
            ) : null}
            {isTrendingDown ? (
              <MaterialSymbol name="trending_down" size={14} className="text-red-500" />
            ) : null}
            <Text
              className={cn(
                'text-[11px] font-semibold tracking-wide',
                isTrendingUp && 'text-green-500',
                isTrendingDown && 'text-red-500',
                !isTrendingUp && !isTrendingDown && 'text-slate-400'
              )}
            >
              {getTrendText()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
