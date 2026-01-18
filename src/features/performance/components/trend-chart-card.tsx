import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

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
  // Normalize data to percentages for bar heights (based on max 400ms range)
  const maxRange = 400;
  const normalizedData = data.map((value) => Math.min((value / maxRange) * 100, 100));
  const isLastIndex = (index: number) => index === data.length - 1;
  const shadowStyle = useShadowStyle('sm');

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
            <Text className="pl-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('performance.dailyAvg')}:{' '}
              <Text className="font-bold text-slate-900 dark:text-white">{averageValue}ms</Text>
            </Text>
          )}
        </View>

        <View className="items-end">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {currentValue.replace('ms', '')}
            </Text>
            <Text className="text-xs font-bold uppercase text-slate-400">ms</Text>
          </View>
          {isBestScore ? (
            <View className="mt-1 flex-row items-center gap-1 rounded-full border border-success-500/10 bg-success-500/10 px-2 py-0.5">
              <MaterialSymbol name="emoji_events" size={12} className="text-success-500" />
              <Text className="text-[10px] font-bold text-success-500">
                {t('performance.best')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Bar Chart */}
      <View className="relative mt-6 h-44">
        {/* Y-axis labels and grid lines */}
        <View className="pointer-events-none absolute inset-0 z-0 flex-col justify-between pb-7">
          {[400, 300, 200].map((label) => (
            <View key={label} className="w-full flex-row items-center">
              <Text className="w-7 pr-2 text-right text-[10px] font-medium text-slate-300">
                {label}
              </Text>
              <View className="h-px flex-1 border-t border-dashed border-slate-200 dark:border-white/10" />
            </View>
          ))}
          <View className="w-full flex-row items-center opacity-0">
            <Text className="w-7 pr-2 text-right text-[10px] font-medium text-slate-300">0</Text>
            <View className="h-px flex-1" />
          </View>
        </View>

        {/* Bars */}
        <View className="absolute inset-0 z-10 flex-row items-end justify-between pb-0 pl-9 pt-2">
          {normalizedData.map((height, index) => {
            const isLast = isLastIndex(index);
            return (
              <View key={index} className="h-full w-full flex-col items-center justify-end gap-2">
                <View
                  className={cn(
                    'w-3 rounded-md',
                    isLast
                      ? 'bg-primary-500 shadow-[0_4px_12px_rgba(19,91,236,0.4)]'
                      : 'bg-slate-200 dark:bg-white/10'
                  )}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
                <Text
                  className={cn(
                    'h-4 text-[10px] font-bold',
                    isLast ? 'text-primary-500' : 'text-slate-400'
                  )}
                >
                  {labels[index] || ''}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
