import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Period, TimePickerType } from '@/types/alarm-enums';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface TimePickerColumnProps {
  value: number;
  onChange: (value: number) => void;
  items: string[];
  type: TimePickerType;
}

function TimePickerColumn({ value, onChange, items, type }: TimePickerColumnProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(value);
  const isInitialized = useRef(false);

  // Scroll to initial position on mount
  useEffect(() => {
    if (!isInitialized.current && scrollViewRef.current) {
      // Delay to ensure layout is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: value * ITEM_HEIGHT,
          animated: false,
        });
        isInitialized.current = true;
      }, 50);
    }
  }, [value]);

  // Update scroll when value changes from parent
  useEffect(() => {
    if (isInitialized.current && value !== selectedIndex) {
      setSelectedIndex(value);
      scrollViewRef.current?.scrollTo({
        y: value * ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [value, selectedIndex]);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

      if (clampedIndex !== selectedIndex) {
        setSelectedIndex(clampedIndex);
        onChange(clampedIndex);
      }
    },
    [selectedIndex, items.length, onChange]
  );

  const getItemStyle = (index: number) => {
    const distance = Math.abs(index - selectedIndex);

    if (distance === 0) {
      return {
        textClassName:
          type === TimePickerType.PERIOD
            ? 'text-2xl font-black text-brand-primary'
            : 'text-5xl font-black text-brand-primary',
        opacity: 1,
      };
    } else if (distance === 1) {
      return {
        textClassName:
          type === TimePickerType.PERIOD
            ? 'text-xl font-bold text-slate-400 dark:text-[#455d8c]'
            : 'text-3xl font-bold text-slate-400 dark:text-[#455d8c]',
        opacity: 0.8,
      };
    } else if (distance === 2) {
      return {
        textClassName:
          type === TimePickerType.PERIOD
            ? 'text-lg font-bold text-slate-400 dark:text-[#455d8c]'
            : 'text-2xl font-bold text-slate-400 dark:text-[#455d8c]',
        opacity: 0.5,
      };
    } else {
      return {
        textClassName: 'text-xl font-bold text-slate-400 dark:text-[#455d8c]',
        opacity: 0.3,
      };
    }
  };

  const renderItem = (item: string, index: number) => {
    const { textClassName, opacity } = getItemStyle(index);

    return (
      <View
        key={`${type}-${item}-${index}`}
        className="items-center justify-center"
        style={{ height: ITEM_HEIGHT }}
      >
        <Text className={`text-center ${textClassName}`} style={{ opacity }}>
          {item}
        </Text>
      </View>
    );
  };

  return (
    <View className="relative overflow-hidden" style={{ height: PICKER_HEIGHT }}>
      {/* Selection indicator background */}
      <View
        className="bg-surface-highlight/50 dark:bg-surface-highlight pointer-events-none absolute inset-x-0 z-0 rounded-lg border border-brand-primary/20"
        style={{
          top: ITEM_HEIGHT * 2,
          height: ITEM_HEIGHT,
        }}
      />

      {/* Scrollable items */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
      >
        {items.map(renderItem)}
      </ScrollView>
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
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periods = [Period.AM, Period.PM];

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
