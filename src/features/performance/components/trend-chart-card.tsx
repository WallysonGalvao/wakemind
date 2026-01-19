import { useEffect, useMemo } from 'react';

import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { BarChart } from 'react-native-chart-kit';
import type { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Dimensions, View } from 'react-native';

import { AnimatedCounter } from '@/components/animated-counter';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import { cn } from '@/utils/cn';

interface TrendChartCardProps {
  icon: string;
  title: string;
  currentValue: string;
  data: number[];
  labels?: string[];
  averageValue?: number;
  isBestScore?: boolean;
  className?: string;
}

export function TrendChartCard({
  icon,
  title,
  currentValue,
  data,
  labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  averageValue,
  isBestScore = false,
  className,
}: TrendChartCardProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shadowStyle = useShadowStyle('sm');

  const screenWidth = Dimensions.get('window').width;

  // Extract numeric value from currentValue (e.g., "450ms" -> 450, or 450 -> 450)
  const numericValue = useMemo(() => {
    console.log('[TrendChartCard] currentValue:', currentValue, 'type:', typeof currentValue);
    if (typeof currentValue === 'number') {
      return currentValue;
    }
    if (typeof currentValue === 'string') {
      // Remove all non-numeric characters and parse
      const parsed = parseInt(currentValue.replace(/\D/g, ''), 10);
      console.log('[TrendChartCard] parsed:', parsed);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, [currentValue]);

  console.log('[TrendChartCard] numericValue:', numericValue);

  // Badge scale animation
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    if (isBestScore) {
      badgeScale.value = withDelay(100, withTiming(1, { duration: 400 }));
    }
  }, [isBestScore, badgeScale]);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));
  const chartWidth = screenWidth - 80; // Account for padding

  const chartStyles = { borderRadius: 8 };

  // Find the index of the last non-zero value (today's data)
  const lastNonZeroIndex = data.reduce(
    (lastIndex, value, index) => (value > 0 ? index : lastIndex),
    -1
  );

  const chartData = {
    labels,
    datasets: [
      {
        data,
        colors: data.map(
          (_, index) =>
            index === lastNonZeroIndex
              ? () => '#135bec' // Primary color for today (last non-zero bar)
              : () => (isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0') // Slate-200 for other bars
        ),
      },
    ],
  };

  const chartConfig: AbstractChartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: isDark ? '#1a1a2e' : '#ffffff',
    backgroundGradientTo: isDark ? '#1a1a2e' : '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: () => (isDark ? 'rgba(255, 255, 255, 0.3)' : '#cbd5e1'),
    labelColor: () => (isDark ? '#94a3b8' : '#94a3b8'),
    barPercentage: 0.4,
    barRadius: 6,
    propsForBackgroundLines: {
      strokeDasharray: '4 4',
      stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
      strokeWidth: 1,
      strokeOpacity: 0.5,
    },
    propsForLabels: {
      dy: 4,
      fontSize: 10,
      fontWeight: 'bold',
    },
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
      <View className="mb-2 flex-row items-start justify-between">
        <View>
          <View className="mb-1 flex-row items-center gap-3">
            <View className="rounded-lg border border-slate-100 bg-slate-50 p-1.5 dark:border-white/5 dark:bg-white/5">
              <MaterialSymbol
                name={icon}
                size={20}
                className="text-slate-400 dark:text-slate-400"
              />
            </View>
            <Text className="text-sm font-bold text-slate-900 dark:text-white">{title}</Text>
          </View>
          {averageValue !== undefined && (
            <View className="flex-row items-baseline gap-0.5 pl-1">
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('performance.dailyAvg')}:{' '}
              </Text>
              <AnimatedCounter
                value={averageValue}
                duration={1000}
                className="text-xs font-bold text-slate-900 dark:text-white"
              />
              <Text className="text-xs font-bold text-slate-900 dark:text-white">ms</Text>
            </View>
          )}
        </View>

        <View className="items-end">
          <View className="flex-row items-baseline gap-1">
            <AnimatedCounter
              value={numericValue}
              duration={1000}
              className="text-3xl font-black tracking-tight text-slate-900 dark:text-white"
            />
            <Text className="text-xs font-bold uppercase text-slate-400">ms</Text>
          </View>
          {isBestScore ? (
            <Animated.View
              style={animatedBadgeStyle}
              className="mt-1 flex-row items-center gap-1 rounded-full border border-success-500/10 bg-success-500/10 px-2 py-0.5"
            >
              <MaterialSymbol name="emoji_events" size={12} className="text-success-500" />
              <Text className="text-[10px] font-bold text-success-500">
                {t('performance.best')}
              </Text>
            </Animated.View>
          ) : null}
        </View>
      </View>

      {/* Bar Chart */}
      <View className="-ml-4 mt-4">
        <BarChart
          data={chartData}
          width={chartWidth}
          height={176}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          fromZero
          showBarTops={false}
          withCustomBarColorFromData
          flatColor
          withInnerLines
          segments={3}
          style={chartStyles}
        />
      </View>
    </View>
  );
}
