import React, { useEffect } from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import type { Alarm } from '@/types/alarm';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
  onDelete?: (id: string) => void;
  isEditMode?: boolean;
  index?: number;
}

const STAGGER_DELAY = 100;
const ANIMATION_DURATION = 250;
const TIMING_CONFIG = {
  duration: ANIMATION_DURATION,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export function AlarmCard({
  alarm,
  onToggle,
  onPress,
  onDelete,
  isEditMode = false,
  index = 0,
}: AlarmCardProps) {
  const isActive = alarm.isEnabled;
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);
  const shadowStyle = useShadowStyle('sm');

  // Shared values for edit mode animations
  const deleteButtonProgress = useSharedValue(isEditMode ? 1 : 0);
  const rightSideProgress = useSharedValue(isEditMode ? 1 : 0);

  // Animate when isEditMode changes
  useEffect(() => {
    deleteButtonProgress.value = withTiming(isEditMode ? 1 : 0, TIMING_CONFIG);
    rightSideProgress.value = withTiming(isEditMode ? 1 : 0, TIMING_CONFIG);
  }, [isEditMode, deleteButtonProgress, rightSideProgress]);

  // Animated styles for delete button (slide in from left + fade)
  const deleteButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: deleteButtonProgress.value,
    transform: [
      { translateX: (1 - deleteButtonProgress.value) * -12 },
      { scale: 0.8 + deleteButtonProgress.value * 0.2 },
    ],
  }));

  // Animated styles for switch (fade out)
  const switchAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - rightSideProgress.value,
    transform: [{ scale: 1 - rightSideProgress.value * 0.2 }],
    position: 'absolute' as const,
    right: 0,
  }));

  // Animated styles for chevron (fade in)
  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rightSideProgress.value,
    transform: [
      { translateX: (1 - rightSideProgress.value) * 10 },
      { scale: 0.8 + rightSideProgress.value * 0.2 },
    ],
  }));

  // Get icon color based on theme and active state
  const getIconColor = () => {
    if (colorScheme === 'dark') {
      return isActive ? COLORS.slate[500] : COLORS.slate[600];
    }
    return isActive ? COLORS.slate[500] : COLORS.slate[400];
  };

  const trackColor = {
    false: colorScheme === 'dark' ? COLORS.slate[600] : COLORS.slate[300],
    true: COLORS.brandPrimary,
  };

  const handleToggle = () => {
    // Haptic feedback on toggle
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(alarm.id);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(alarm.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete(alarm.id);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Staggered entry animation
  const enteringAnimation = FadeInDown.delay(index * STAGGER_DELAY)
    .duration(400)
    .easing(Easing.out(Easing.cubic));

  return (
    <Pressable accessibilityRole="button" onPress={handlePress}>
      <Animated.View
        entering={enteringAnimation}
        style={[animatedStyle, shadowStyle]}
        className={`rounded-2xl border p-5 ${
          isActive
            ? colorScheme === 'dark'
              ? 'border-slate-700 bg-[#1a2230]'
              : 'border-slate-200 bg-white'
            : colorScheme === 'dark'
              ? 'border-slate-800/50 bg-[#1a2230]/50'
              : 'border-slate-100 bg-white/50'
        }`}
      >
        <View className="flex-row items-center justify-between">
          {/* Delete Button (Animated - only rendered in edit mode) */}
          {isEditMode ? (
            <Animated.View style={deleteButtonAnimatedStyle} className="mr-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete alarm"
                accessibilityHint="Removes this alarm from your list"
                onPress={handleDelete}
                className="items-center justify-center rounded-full active:opacity-70"
              >
                <MaterialSymbol name="do_not_disturb_on" size={28} className="text-red-500" />
              </Pressable>
            </Animated.View>
          ) : null}

          {/* Left Side: Time and Info */}
          <View className="flex-1 gap-1">
            {/* Time Display */}
            <View className="flex-row items-baseline gap-2">
              <Text
                className={`text-5xl font-bold tracking-tight ${
                  isActive
                    ? colorScheme === 'dark'
                      ? 'text-white'
                      : 'text-slate-900'
                    : colorScheme === 'dark'
                      ? 'text-slate-600'
                      : 'text-slate-400'
                }`}
              >
                {alarm.time}
              </Text>
              <Text
                className={`text-xl font-medium ${
                  isActive
                    ? colorScheme === 'dark'
                      ? 'text-slate-400'
                      : 'text-slate-500'
                    : colorScheme === 'dark'
                      ? 'text-slate-600'
                      : 'text-slate-400'
                }`}
              >
                {alarm.period}
              </Text>
            </View>

            {/* Challenge and Schedule Info */}
            <View className="mt-1 flex-row items-center gap-2">
              <MaterialIcons
                name={alarm.challengeIcon as keyof typeof MaterialIcons.glyphMap}
                size={20}
                color={getIconColor()}
              />
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? colorScheme === 'dark'
                      ? 'text-slate-400'
                      : 'text-slate-600'
                    : colorScheme === 'dark'
                      ? 'text-slate-600'
                      : 'text-slate-400'
                }`}
              >
                {alarm.challenge}
                <Text
                  className={
                    isActive
                      ? colorScheme === 'dark'
                        ? 'text-slate-600'
                        : 'text-slate-400'
                      : colorScheme === 'dark'
                        ? 'text-slate-700'
                        : 'text-slate-300'
                  }
                >
                  {' • '}
                </Text>
                {alarm.schedule}
              </Text>
            </View>
          </View>

          {/* Right Side: Toggle Switch OR Chevron (Crossfade) */}
          <View className="relative min-h-[32px] min-w-[52px] items-center justify-center pl-4">
            {/* Switch (fades out) */}
            <Animated.View style={switchAnimatedStyle} pointerEvents={isEditMode ? 'none' : 'auto'}>
              <Switch
                value={alarm.isEnabled}
                onValueChange={handleToggle}
                trackColor={trackColor}
                thumbColor={COLORS.white}
                size="lg"
              />
            </Animated.View>

            {/* Chevron (fades in) */}
            <Animated.View
              style={chevronAnimatedStyle}
              pointerEvents={isEditMode ? 'auto' : 'none'}
            >
              <MaterialSymbol
                name="chevron_right"
                size={28}
                className={colorScheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}
              />
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
