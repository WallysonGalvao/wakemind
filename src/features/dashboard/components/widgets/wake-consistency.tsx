import React from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';

import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface WakeConsistencyProps {
  targetTime: string; // "06:00"
  averageTime: string; // "06:05"
  variance: number; // minutes difference (positive = late, negative = early)
  period: string; // "Last 30 Days"
  chartData: number[]; // Array of variance values for each day
  onDetailsPress?: () => void;
}

export function WakeConsistency({
  targetTime,
  averageTime,
  variance,
  period,
  chartData,
  onDetailsPress,
}: WakeConsistencyProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const shadowStyle = useShadowStyle('sm');
  const isDark = colorScheme === 'dark';

  const handleInfoPress = () => {
    router.push('/dashboard/modals/wake-consistency-info');
  };

  const screenWidth = Dimensions.get('window').width - 32; // padding

  // Sanitize chart data - ensure all values are valid numbers
  const sanitizedChartData = chartData
    .map((value) => {
      const num = Number(value);
      return Number.isFinite(num) ? Math.max(0, Math.min(num, 180)) : 0;
    })
    .slice(0, 30); // Max 30 points

  // Ensure we have at least 2 data points for the chart
  const validChartData =
    sanitizedChartData.length >= 2 ? sanitizedChartData : [0, 0, 0, 0, 0, 0, 0];

  // Generate labels based on actual data length
  const generateLabels = (dataLength: number): string[] => {
    if (dataLength <= 7) {
      // Show all days
      return Array.from({ length: dataLength }, (_, i) => (i + 1).toString());
    }
    // Show 7 evenly spaced labels
    const labelCount = 7;
    const step = Math.floor((dataLength - 1) / (labelCount - 1));
    return Array.from({ length: labelCount }, (_, i) => {
      if (i === labelCount - 1) return dataLength.toString();
      return (i * step + 1).toString();
    });
  };

  const chartLabels = generateLabels(validChartData.length);

  // Format variance text
  const varianceText = variance > 0 ? `+${variance}m` : `${variance}m`;
  const varianceColor = variance > 0 ? 'text-red-500' : 'text-green-500';

  return (
    <View className="flex-col gap-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-1">
        <Text className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          {t('dashboard.wakeConsistency.title')}
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
        className="rounded-xl border border-slate-200 bg-white p-5 dark:border-transparent dark:bg-surface-dark"
        style={shadowStyle}
      >
        {/* Stats Header */}
        <View className="mb-6 flex-row items-end justify-between">
          <View>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('dashboard.wakeConsistency.targetVsActual')}
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {targetTime}
              </Text>
              <Text className="text-xs text-slate-400">→</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {averageTime}
                </Text>
                <Text className="text-sm font-normal text-slate-400">
                  {t('dashboard.wakeConsistency.amAvg')}
                </Text>
              </View>
            </View>
          </View>
          <View className="text-right">
            <Text className={`text-sm font-bold ${varianceColor}`}>
              {varianceText} {t('dashboard.wakeConsistency.variance')}
            </Text>
            <Text className="text-xs text-slate-400">{period}</Text>
          </View>
        </View>

        {/* Chart */}
        <View className="overflow-hidden rounded-lg">
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [
                {
                  data: validChartData,
                },
              ],
            }}
            width={screenWidth}
            height={180}
            withVerticalLabels
            withHorizontalLabels={false}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines
            withDots={false}
            bezier
            chartConfig={{
              backgroundColor: isDark ? '#1a2230' : '#ffffff',
              backgroundGradientFrom: isDark ? '#1a2230' : '#ffffff',
              backgroundGradientTo: isDark ? '#1a2230' : '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(19, 91, 236, ${opacity})`,
              labelColor: (opacity = 1) =>
                isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
              style: {
                borderRadius: 8,
              },
              propsForDots: {
                r: '0',
              },
              propsForBackgroundLines: {
                strokeDasharray: '4 4 ',
                stroke: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                strokeWidth: 1,
                strokeOpacity: 0.5,
              },
            }}
            style={styles.chart}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    marginLeft: -16,
    marginRight: -16,
    paddingRight: 0,
    borderRadius: 8,
  },
});
