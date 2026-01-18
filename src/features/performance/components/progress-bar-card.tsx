import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
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
  const isTrendingUp = previousValue !== undefined && value > previousValue;
  const isTrendingDown = previousValue !== undefined && value < previousValue;

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
        <Text className="text-sm font-bold text-slate-900 dark:text-white">
          {displayValue || `${value}%`}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <View
          className="absolute left-0 top-0 h-full rounded-full bg-primary-500"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </View>

      {/* Footer with trend */}
      {previousValue !== undefined && (
        <View className="mt-2 flex-row justify-between">
          <Text className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Last Week: {previousValue}%
          </Text>
          <Text
            className={cn(
              'text-[10px] font-medium uppercase tracking-wide',
              isTrendingUp && 'text-success',
              isTrendingDown && 'text-red-500',
              !isTrendingUp && !isTrendingDown && 'text-slate-400'
            )}
          >
            {isTrendingUp ? 'Trending Up' : isTrendingDown ? 'Trending Down' : 'Stable'}
          </Text>
        </View>
      )}
    </View>
  );
}
