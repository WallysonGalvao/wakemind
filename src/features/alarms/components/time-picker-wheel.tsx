import React, { useCallback, useRef, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface TimePickerWheelProps {
  value: number;
  onChange: (value: number) => void;
  items: string[];
  type: 'hour' | 'minute' | 'period';
}

function TimePickerColumn({ value, onChange, items, type }: TimePickerWheelProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(value);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      if (index !== selectedIndex && index >= 0 && index < items.length) {
        setSelectedIndex(index);
        onChange(index);
      }
    },
    [selectedIndex, items.length, onChange]
  );

  const renderItem = (item: string, index: number) => {
    const distance = Math.abs(index - selectedIndex);
    const isSelected = index === selectedIndex;

    let textClassName = 'font-bold text-center';
    let opacity = 1;
    let blur = 0;

    if (distance === 0) {
      textClassName += ' text-5xl text-primary scale-110';
    } else if (distance === 1) {
      textClassName += ' text-3xl text-slate-400 dark:text-slate-500';
      opacity = 0.8;
    } else if (distance === 2) {
      textClassName += ' text-2xl text-slate-400 dark:text-slate-500';
      opacity = 0.5;
      blur = 1;
    } else {
      textClassName += ' text-xl text-slate-400 dark:text-slate-500';
      opacity = 0.3;
      blur = 1;
    }

    return (
      <View
        key={`${item}-${index}`}
        className="items-center justify-center"
        style={{ height: ITEM_HEIGHT }}
      >
        <Text className={textClassName} style={{ opacity }}>
          {item}
        </Text>
      </View>
    );
  };

  return (
    <View className="relative overflow-hidden" style={{ height: PICKER_HEIGHT }}>
      {/* Selection indicator background */}
      <View
        className="border-primary/20 bg-surface-highlight/50 dark:bg-surface-highlight pointer-events-none absolute inset-x-0 z-0 rounded-lg border"
        style={{
          top: '38%',
          height: ITEM_HEIGHT - 8,
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
  period: 'AM' | 'PM';
  onTimeChange: (hour: number, minute: number, period: 'AM' | 'PM') => void;
}

export function TimePickerWheel({ hour, minute, period, onTimeChange }: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periods = ['AM', 'PM'];

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
      onTimeChange(hour, minute, index === 0 ? 'AM' : 'PM');
    },
    [hour, minute, onTimeChange]
  );

  return (
    <View className="relative flex-col items-center justify-center py-8">
      {/* Decorative gradient */}
      <View className="via-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-transparent" />

      {/* Time picker columns */}
      <View className="z-10 w-full max-w-[320px] flex-row items-center gap-2 px-4">
        {/* Hours */}
        <View className="flex-1">
          <TimePickerColumn
            value={hour - 1}
            onChange={handleHourChange}
            items={hours}
            type="hour"
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
            type="minute"
          />
        </View>

        {/* AM/PM */}
        <View className="flex-[0.5]">
          <TimePickerColumn
            value={period === 'AM' ? 0 : 1}
            onChange={handlePeriodChange}
            items={periods}
            type="period"
          />
        </View>
      </View>
    </View>
  );
}
