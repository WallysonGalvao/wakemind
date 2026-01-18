import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';
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
  const shadowStyle = useShadowStyle('sm');

  return (
    <View
      style={shadowStyle}
      className={cn(
        'flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 dark:border-white/5 dark:bg-surface-dark',
        className
      )}
    >
      {/* Header with icon and badge */}
      <View className="flex-row items-center justify-between">
        <View
          className={cn(
            'rounded-xl border border-slate-100/50 p-2 dark:border-white/5',
            iconBgColor
          )}
        >
          <MaterialSymbol name={icon} size={20} className={iconColor} />
        </View>
        {badge ? (
          <View className="rounded-md border border-success-500/10 bg-success-500/5 px-2 py-1">
            <Text className={cn('text-xs font-bold', badge.color)}>{badge.text}</Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View>
        <Text className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
          {title}
        </Text>
        <Text className="text-3xl font-black leading-none tracking-tight text-slate-900 dark:text-white">
          {value}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
