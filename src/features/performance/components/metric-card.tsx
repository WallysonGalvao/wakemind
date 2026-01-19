import { useEffect, useState } from 'react';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

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

  // Animation values
  const counterValue = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  // State for displaying animated counter
  const [displayCounter, setDisplayCounter] = useState(0);

  // Check if value is a number for counter animation
  const isNumericValue = typeof value === 'number';
  const numericValue = isNumericValue ? value : 0;

  // Start animations on mount
  useEffect(() => {
    if (isNumericValue) {
      counterValue.value = withTiming(
        numericValue,
        {
          duration: 1000,
        },
        () => {
          // Ensure final value is set correctly
          runOnJS(setDisplayCounter)(numericValue);
        }
      );
    }

    if (badge) {
      badgeScale.value = withDelay(
        100,
        withTiming(1, {
          duration: 400,
        })
      );
    }
  }, [isNumericValue, numericValue, badge, counterValue, badgeScale]);

  // Update display counter during animation
  useEffect(() => {
    if (!isNumericValue) return;

    const interval = setInterval(() => {
      const current = Math.round(counterValue.value);
      setDisplayCounter(current);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isNumericValue, counterValue]);

  // Animated styles
  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

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
          <Animated.View
            style={badgeAnimatedStyle}
            className="rounded-md border border-green-400/10 bg-green-400/5 px-2 py-1"
          >
            <Text className={cn('text-xs font-bold', badge.color)}>{badge.text}</Text>
          </Animated.View>
        ) : null}
      </View>

      {/* Content */}
      <View>
        <Text className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
          {title}
        </Text>
        <Text className="text-3xl font-black leading-none tracking-tight text-slate-900 dark:text-white">
          {isNumericValue ? displayCounter : value}
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
