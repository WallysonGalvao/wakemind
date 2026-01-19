import React from 'react';

import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface DailyExecutionScoreProps {
  score: number;
  maxScore?: number;
  percentageChange?: number;
  comparisonPeriod?: string;
}

export function DailyExecutionScore({
  score,
  maxScore = 100,
  percentageChange = 0,
  comparisonPeriod = 'vs last 7 days',
}: DailyExecutionScoreProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');
  const isPositive = percentageChange >= 0;

  return (
    <View
      className="rounded-xl border border-slate-200 bg-white p-6 dark:border-transparent dark:bg-surface-dark"
      style={shadowStyle}
    >
      {/* Header with score and mini chart */}
      <View className="mb-2 flex-row items-start justify-between">
        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('dashboard.executionScore.title')}
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text className="text-5xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {score}
            </Text>
            <Text className="text-lg font-medium text-slate-400">/{maxScore}</Text>
          </View>
        </View>

        {/* Mini Sparkline */}
        <View className="h-12 w-24">
          <Svg width="100%" height="100%" viewBox="0 0 100 50">
            <Path
              d="M0 40 L10 35 L20 38 L30 25 L40 30 L50 20 L60 25 L70 15 L80 18 L90 5 L100 10"
              fill="none"
              stroke="#135bec"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
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
        <Text className="text-sm text-slate-500 dark:text-slate-400">{comparisonPeriod}</Text>
      </View>
    </View>
  );
}
