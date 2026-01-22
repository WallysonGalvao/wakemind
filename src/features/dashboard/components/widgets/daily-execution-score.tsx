import React, { useEffect } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Pressable, View } from 'react-native';

import type { PeriodType } from '../../types';

import { AnimatedCounter } from '@/components/animated-counter';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface DailyExecutionScoreProps {
  score: number;
  maxScore?: number;
  percentageChange?: number;
  period?: PeriodType;
  sparklineData?: number[];
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function DailyExecutionScore({
  score,
  maxScore = 100,
  percentageChange = 0,
  period = 'day',
  sparklineData = [],
}: DailyExecutionScoreProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const shadowStyle = useShadowStyle('sm');
  const isPositive = percentageChange >= 0;

  // Animation values
  const pathProgress = useSharedValue(0);

  // Trigger animation when component mounts or data changes
  useEffect(() => {
    pathProgress.value = 0;
    pathProgress.value = withTiming(1, { duration: 1000 });
  }, [sparklineData, pathProgress]);

  // Generate dynamic SVG path from sparkline data
  const generateSparklinePath = () => {
    if (sparklineData.length === 0) {
      // Return flat line when no data
      return 'M0 25 L100 25';
    }

    const maxValue = Math.max(...sparklineData, 1);
    const minValue = Math.min(...sparklineData, 0);
    const range = maxValue - minValue || 1;
    const width = 100;
    const height = 50;
    const stepX = width / (sparklineData.length - 1 || 1);

    return sparklineData
      .map((value, index) => {
        const x = index * stepX;
        const y = height - ((value - minValue) / range) * height * 0.8;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const sparklinePath = generateSparklinePath();

  // Animated props for the path
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - pathProgress.value) * 500,
  }));

  // Dynamic stroke color based on trend
  const strokeColor = isPositive ? '#135bec' : '#ef4444'; // green-500 : red-500

  const handleInfoPress = () => {
    router.push('/dashboard/modals/execution-score-info');
  };

  return (
    <View className="flex-col gap-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-1">
        <Text className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          {t(`dashboard.executionScore.title.${period}`)}
        </Text>
        <Pressable
          onPress={handleInfoPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.info')}
          accessibilityHint={t('common.infoModal.accessibilityHint')}
        >
          <MaterialSymbol name="info" size={20} className="text-slate-400 dark:text-slate-500" />
        </Pressable>
      </View>

      {/* Card */}
      <View
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-transparent dark:bg-surface-dark"
        style={shadowStyle}
      >
        {/* Score and mini chart */}
        <View className="mb-2 flex-row items-start justify-between">
          <View className="flex-row items-baseline gap-2">
            <AnimatedCounter
              value={score}
              className="text-5xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white"
            />
            <Text className="text-lg font-medium text-slate-400">/{maxScore}</Text>
          </View>

          {/* Mini Sparkline */}
          <View className="h-12 w-24">
            <Svg width="100%" height="100%" viewBox="0 0 100 50">
              <AnimatedPath
                d={sparklinePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeDasharray="500"
                animatedProps={animatedProps}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        {/* Trend indicator */}
        <View className="mt-2 flex-row items-center gap-2">
          <View
            className={`flex-row items-center rounded px-2 py-0.5 ${
              isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}
          >
            <MaterialSymbol
              name={isPositive ? 'trending_up' : 'trending_down'}
              size={14}
              className={`mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}
            />
            <Text className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}
              {percentageChange.toFixed(1)}%
            </Text>
          </View>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            {t(`dashboard.executionScore.comparisonPeriod.${period}`)}
          </Text>
        </View>
      </View>
    </View>
  );
}
