import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Period, TimePickerType } from '@/types/alarm-enums';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface AnimatedItemProps {
  item: string;
  index: number;
  scrollY: SharedValue<number>;
  type: TimePickerType;
  selectedIndex: number;
}

function AnimatedItem({ item, index, scrollY, type, selectedIndex }: AnimatedItemProps) {
  const inputRange = useMemo(
    () => [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ],
    [index]
  );

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.7, 0.85, 1.1, 0.85, 0.7],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.4, 0.6, 1, 0.6, 0.4],
      Extrapolation.CLAMP
    );

    const rotateX = interpolate(
      scrollY.value,
      inputRange,
      [45, 20, 0, -20, -45],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { perspective: 500 }, { rotateX: `${rotateX}deg` }],
      opacity,
    };
  });

  // Determine text class based on distance from selected index
  const distance = Math.abs(selectedIndex - index);

  const getTextClass = useMemo(() => {
    // Base size based on type
    const sizeClass = type === TimePickerType.PERIOD ? 'text-2xl' : 'text-5xl';

    if (distance === 0) {
      // Selected item - brand primary
      return `${sizeClass} font-black text-brand-primary`;
    } else if (distance === 1) {
      // Adjacent items - slate-500
      return `${type === TimePickerType.PERIOD ? 'text-xl' : 'text-3xl'} font-bold text-slate-500 dark:text-slate-400`;
    } else {
      // Distant items - slate-400
      return `${type === TimePickerType.PERIOD ? 'text-lg' : 'text-2xl'} font-bold text-slate-400 dark:text-slate-500`;
    }
  }, [type, distance]);

  return (
    <Animated.View
      className="items-center justify-center"
      style={[{ height: ITEM_HEIGHT }, animatedStyle]}
    >
      <Text className={`text-center ${getTextClass}`}>{item}</Text>
    </Animated.View>
  );
}

interface TimePickerColumnProps {
  value: number;
  onChange: (value: number) => void;
  items: string[];
  type: TimePickerType;
}

function TimePickerColumn({ value, onChange, items, type }: TimePickerColumnProps) {
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const isInitialized = useRef(false);

  // Scroll to initial position on mount
  useEffect(() => {
    if (!isInitialized.current && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: value * ITEM_HEIGHT,
          animated: false,
        });
        scrollY.value = value * ITEM_HEIGHT;
        isInitialized.current = true;
      }, 50);
    }
  }, [value, scrollY]);

  // Update scroll when value changes from parent
  useEffect(() => {
    if (isInitialized.current) {
      const currentIndex = Math.round(scrollY.value / ITEM_HEIGHT);
      if (value !== currentIndex) {
        scrollViewRef.current?.scrollTo({
          y: value * ITEM_HEIGHT,
          animated: true,
        });
      }
    }
  }, [value, scrollY]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      onChange(clampedIndex);
    },
    [items.length, onChange]
  );

  return (
    <View className="relative overflow-hidden" style={{ height: PICKER_HEIGHT }}>
      {/* Selection indicator background */}
      <View
        className="pointer-events-none absolute inset-x-0 z-0 rounded-lg border border-slate-300/50 bg-slate-200/80 dark:border-brand-primary/20 dark:bg-surface-highlight"
        style={{
          top: ITEM_HEIGHT * 2,
          height: ITEM_HEIGHT,
        }}
      />

      {/* Scrollable items */}
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={`${type}-${item}-${index}`}
            item={item}
            index={index}
            scrollY={scrollY}
            type={type}
            selectedIndex={value}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

interface TimePickerProps {
  hour: number;
  minute: number;
  period: Period;
  onTimeChange: (hour: number, minute: number, period: Period) => void;
}

export function TimePickerWheel({ hour, minute, period, onTimeChange }: TimePickerProps) {
  const hours = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
    []
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
    []
  );
  const periods = useMemo(() => [Period.AM, Period.PM], []);

  const handleHourChange = useCallback(
    (index: number) => {
      onTimeChange(index + 1, minute, period);
    },
    [minute, period, onTimeChange]
  );

  const handleMinuteChange = useCallback(
    (index: number) => {
      onTimeChange(hour, index, period);
    },
    [hour, period, onTimeChange]
  );

  const handlePeriodChange = useCallback(
    (index: number) => {
      onTimeChange(hour, minute, index === 0 ? Period.AM : Period.PM);
    },
    [hour, minute, onTimeChange]
  );

  return (
    <View className="relative flex-col items-center justify-center py-6">
      {/* Decorative gradient */}
      <View className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent" />

      {/* Time picker columns */}
      <View className="z-10 w-full max-w-[320px] flex-row items-center gap-2 px-4 py-1">
        {/* Hours */}
        <View className="flex-1">
          <TimePickerColumn
            value={hour - 1}
            onChange={handleHourChange}
            items={hours}
            type={TimePickerType.HOUR}
          />
        </View>

        {/* Separator */}
        <Text className="pb-2 text-4xl font-black text-slate-300 dark:text-slate-600">:</Text>

        {/* Minutes */}
        <View className="flex-1">
          <TimePickerColumn
            value={minute}
            onChange={handleMinuteChange}
            items={minutes}
            type={TimePickerType.MINUTE}
          />
        </View>

        {/* AM/PM */}
        <View className="flex-[0.5]">
          <TimePickerColumn
            value={period === Period.AM ? 0 : 1}
            onChange={handlePeriodChange}
            items={periods}
            type={TimePickerType.PERIOD}
          />
        </View>
      </View>
    </View>
  );
}
