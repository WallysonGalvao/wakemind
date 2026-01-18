import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

interface TrendChartCardProps {
  icon: string;
  title: string;
  currentValue: string;
  data: number[]; // Array of values (up to 7 for weekly)
  labels?: string[];
  className?: string;
}

export function TrendChartCard({
  icon,
  title,
  currentValue,
  data,
  labels = ['M', 'T', 'W', 'T', 'F', 'S'],
  className,
}: TrendChartCardProps) {
  // Normalize data to percentages for bar heights
  const maxValue = Math.max(...data, 1);
  const normalizedData = data.map((value) => (value / maxValue) * 100);

  return (
    <View
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-surface-dark',
        className
      )}
    >
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name={icon} size={20} className="text-slate-400 dark:text-slate-400" />
          <Text className="text-sm font-bold text-slate-900 dark:text-white">{title}</Text>
        </View>
        <View className="rounded bg-primary-500/10 px-2 py-1">
          <Text className="text-xs font-bold text-primary-500">{currentValue}</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View className="h-24 flex-row items-end justify-between gap-2 border-b border-slate-100 pb-0 pt-4 dark:border-white/5">
        {normalizedData.map((height, index) => {
          const isLast = index === normalizedData.length - 1;
          return (
            <View key={index} className="w-full flex-col items-center gap-1">
              <View
                className={cn(
                  'w-full rounded-t-sm',
                  isLast
                    ? 'bg-primary-500 shadow-[0_0_15px_rgba(19,91,236,0.5)]'
                    : 'bg-slate-200 dark:bg-white/10'
                )}
                style={{ height: `${Math.max(height, 5)}%` }}
              />
            </View>
          );
        })}
      </View>

      {/* Labels */}
      <View className="mt-2 flex-row justify-between">
        {labels.slice(0, data.length).map((label, index) => {
          const isLast = index === data.length - 1;
          return (
            <Text
              key={index}
              className={cn(
                'text-[10px] font-medium',
                isLast ? 'font-bold text-primary-500' : 'text-slate-400'
              )}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
