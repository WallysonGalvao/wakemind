import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { LayoutChangeEvent } from 'react-native';
import { Text, View } from 'react-native';
import { Pressable } from 'react-native';

import { cn } from '@/utils/cn';
import { capitalize } from '@/utils/string';

type ButtonGroupProps<T extends string> = {
  options: readonly T[];
  defaultValue: T;
  onChange: (selected: T) => void;
};

const ButtonGroupComponent = <T extends string>({
  options,
  defaultValue,
  onChange,
}: ButtonGroupProps<T>) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const selectedIndex = options.indexOf(selectedOption);

  const translateX = useSharedValue(0);
  const buttonWidth = useSharedValue(0);
  const startX = useSharedValue(0);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: buttonWidth.value,
  }));

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      buttonWidth.value = width / options.length - 4;
      translateX.value = selectedIndex * buttonWidth.value;
    },
    [options.length, selectedIndex, buttonWidth, translateX]
  );

  const handleSelect = useCallback(
    (value: T) => {
      if (value === selectedOption) return;
      setSelectedOption(value);
      onChange(value);
    },
    [selectedOption, onChange]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          'worklet';
          startX.value = translateX.value;
        })
        .onUpdate((event) => {
          'worklet';
          const newX = startX.value + event.translationX;
          const maxX = (options.length - 1) * buttonWidth.value;

          if (newX >= 0 && newX <= maxX) {
            translateX.value = newX;
          }
        })
        .onEnd((event) => {
          'worklet';
          const newX = startX.value + event.translationX;
          const closestIndex = Math.round(newX / buttonWidth.value);
          const validatedIndex = Math.min(Math.max(closestIndex, 0), options.length - 1);

          translateX.value = withTiming(validatedIndex * buttonWidth.value, {
            duration: 150,
            easing: Easing.out(Easing.cubic),
          });

          runOnJS(handleSelect)(options[validatedIndex]!);
        }),
    [options, buttonWidth, translateX, startX, handleSelect]
  );

  useEffect(() => {
    translateX.value = withTiming(selectedIndex * buttonWidth.value, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
    startX.value = selectedIndex * buttonWidth.value;
  }, [selectedIndex, translateX, buttonWidth, startX]);

  return (
    <GestureDetector gesture={panGesture}>
      <View
        className="bg-light relative my-2 flex-row items-center rounded p-1 web:transition-colors"
        onLayout={onLayout}
        accessible
        accessibilityRole="tablist"
        accessibilityLabel={t('BUTTON_GROUP_LABEL', {
          count: options.length,
          options: options.map((o) => capitalize(t(o.toUpperCase()))).join(', '),
        })}
        accessibilityHint={t('BUTTON_GROUP_HINT')}
      >
        <Animated.View
          style={sliderStyle}
          className="bg-primary dark:bg-primary absolute left-1 z-10 h-9 rounded web:transition-all"
        />

        {options.map((label) => {
          const selected = label === selectedOption;
          const labelText = capitalize(t(label.toUpperCase()));
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={`${labelText} option`}
              accessibilityHint={selected ? 'Currently selected' : 'Tap to select this option'}
              accessibilityState={{ selected }}
              testID={`button-${label}`}
              key={label}
              onPress={() => handleSelect(label)}
              disabled={selected}
              className={cn(
                'z-10 h-10 flex-1 items-center justify-center rounded web:transition-all',
                'web:focus-visible:outline-primary web:focus-visible:outline-2 web:focus-visible:outline-offset-1',
                !selected && 'web:dark:hover:primary/10 web:hover:bg-gray-100'
              )}
            >
              <Text
                className={cn(
                  'font-semibold web:transition-colors',
                  selected ? 'text-white' : 'text-primary'
                )}
                accessible
                accessibilityRole="text"
              >
                {labelText}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GestureDetector>
  );
};

export const ButtonGroup = memo(ButtonGroupComponent) as typeof ButtonGroupComponent;
