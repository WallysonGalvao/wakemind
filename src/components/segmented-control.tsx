// @react-compiler-ignore-file
import React, { useCallback, useEffect, useRef } from 'react';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { LayoutChangeEvent } from 'react-native';
import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';

export interface SegmentedControlItem<T extends string> {
  value: T;
  label: string;
  icon?: string;
  showIconWhenSelected?: boolean;
}

interface SegmentedControlProps<T extends string> {
  title?: string;
  description?: string;
  items: SegmentedControlItem<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  multiSelect?: boolean;
  selectedValues?: T[];
}

const ANIMATION_CONFIG = {
  duration: 150,
  easing: Easing.out(Easing.cubic),
};

export function SegmentedControl<T extends string>({
  title,
  description,
  items,
  selectedValue,
  onValueChange,
  multiSelect = false,
  selectedValues = [],
}: SegmentedControlProps<T>) {
  const shadowStyle = useShadowStyle('sm');

  const selectedIndex = items.findIndex((item) => item.value === selectedValue);
  const translateX = useSharedValue(0);
  const buttonWidth = useSharedValue(0);
  const slotWidth = useSharedValue(0);
  const startX = useSharedValue(0);

  // Use refs to track values without triggering React Compiler warnings
  const itemsLengthRef = useRef(items.length);
  const selectedIndexRef = useRef(selectedIndex);

  itemsLengthRef.current = items.length;
  selectedIndexRef.current = selectedIndex;

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: buttonWidth.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const containerWidth = event.nativeEvent.layout.width;
    const padding = 4; // p-1 = 4px
    const innerWidth = containerWidth - padding * 2;
    const calculatedSlotWidth = innerWidth / itemsLengthRef.current;

    slotWidth.value = calculatedSlotWidth;
    buttonWidth.value = calculatedSlotWidth;
    translateX.value = selectedIndexRef.current * calculatedSlotWidth;
    startX.value = selectedIndexRef.current * calculatedSlotWidth;
  };

  const handleSelect = useCallback(
    (value: T) => {
      // In multi-select mode, always call onValueChange to allow toggle
      if (multiSelect) {
        onValueChange(value);
        return;
      }
      // In single-select mode, prevent selecting the same value
      if (value === selectedValue) return;
      onValueChange(value);
    },
    [selectedValue, onValueChange, multiSelect]
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newX = startX.value + event.translationX;
      const maxX = (itemsLengthRef.current - 1) * slotWidth.value;

      if (newX >= 0 && newX <= maxX) {
        translateX.value = newX;
      }
    })
    .onEnd((event) => {
      'worklet';
      const newX = startX.value + event.translationX;
      const closestIndex = Math.round(newX / slotWidth.value);
      const validatedIndex = Math.min(Math.max(closestIndex, 0), itemsLengthRef.current - 1);

      translateX.value = withTiming(validatedIndex * slotWidth.value, ANIMATION_CONFIG);

      const selectedItem = items[validatedIndex];
      if (selectedItem) {
        runOnJS(handleSelect)(selectedItem.value);
      }
    });

  useEffect(() => {
    const targetPosition = selectedIndex * slotWidth.value;
    if (slotWidth.value > 0 && translateX.value !== targetPosition) {
      translateX.value = withTiming(targetPosition, ANIMATION_CONFIG);
      startX.value = targetPosition;
    }
  }, [selectedIndex]);

  return (
    <View className="flex flex-col gap-2 px-4 py-3">
      {title ? (
        <Text className="pl-1 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</Text>
      ) : null}

      {multiSelect ? (
        // Multi-select mode: static buttons with individual highlights
        <View
          className="relative flex h-12 w-full flex-row items-center justify-center gap-1 rounded-xl bg-slate-200 p-1 dark:bg-surface-highlight"
          accessible
          accessibilityRole="tablist"
        >
          {items.map((item) => {
            const isSelected = selectedValues.includes(item.value);
            const showIcon = item.icon && item.showIconWhenSelected && isSelected;

            return (
              <Pressable
                key={item.value}
                onPress={() => handleSelect(item.value)}
                style={isSelected ? shadowStyle : undefined}
                className={`z-20 h-full flex-1 flex-row items-center justify-center gap-1 rounded-lg ${
                  isSelected
                    ? 'border border-slate-100 bg-white dark:border-transparent dark:bg-brand-primary'
                    : ''
                }`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                {showIcon && item.icon ? (
                  <MaterialSymbol
                    name={item.icon}
                    size={16}
                    className="text-brand-primary dark:text-white"
                  />
                ) : null}
                <Text
                  className={`text-sm ${isSelected ? 'font-bold' : 'font-medium'} ${
                    isSelected
                      ? 'text-brand-primary dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        // Single-select mode: animated slider
        <GestureDetector gesture={panGesture}>
          <View
            className="relative flex h-12 w-full flex-row items-center justify-center rounded-xl bg-slate-200 p-1 dark:bg-surface-highlight"
            onLayout={onLayout}
            accessible
            accessibilityRole="tablist"
          >
            {/* Animated slider background */}
            <Animated.View
              style={[sliderStyle, shadowStyle]}
              className="absolute left-1 z-10 h-10 rounded-lg border border-slate-100 bg-white dark:border-transparent dark:bg-brand-primary"
            />

            {items.map((item) => {
              const isSelected = selectedValue === item.value;
              const showIcon = item.icon && item.showIconWhenSelected && isSelected;

              return (
                <Pressable
                  key={item.value}
                  onPress={() => handleSelect(item.value)}
                  disabled={isSelected}
                  className="z-20 h-full flex-1 flex-row items-center justify-center gap-1 rounded-lg"
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                >
                  {showIcon && item.icon ? (
                    <MaterialSymbol
                      name={item.icon}
                      size={16}
                      className="text-brand-primary dark:text-white"
                    />
                  ) : null}
                  <Text
                    className={`text-sm ${isSelected ? 'font-bold' : 'font-medium'} ${
                      isSelected
                        ? 'text-brand-primary dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GestureDetector>
      )}

      {description ? (
        <Text className="pl-1 pt-1 text-xs text-slate-500 dark:text-slate-400">{description}</Text>
      ) : null}
    </View>
  );
}
