import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    color: string;
  };
  className?: string;
}

export function MetricCard({
  icon,
  iconColor,
  iconBgColor,
  title,
  value,
  subtitle,
  badge,
  className,
}: MetricCardProps) {
  return (
    <View
      className={cn(
        'flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-surface-dark',
        className
      )}
    >
      {/* Header with icon and badge */}
      <View className="flex-row items-center justify-between">
        <View className={cn('rounded-lg p-2', iconBgColor)}>
          <MaterialSymbol name={icon} size={20} className={iconColor} />
        </View>
        {badge ? <Text className={cn('text-xs font-bold', badge.color)}>{badge.text}</Text> : null}
      </View>

      {/* Content */}
      <View>
        <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </Text>
        <Text className="text-3xl font-bold leading-none text-slate-900 dark:text-white">
          {value}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}
