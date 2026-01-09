import React, { useEffect, useMemo } from 'react';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

interface AlarmsHeaderProps {
  title: string;
  editLabel: string;
  doneLabel: string;
  isEditMode: boolean;
  onEditPress?: () => void;
  showEdit?: boolean;
}

const ANIMATION_DURATION = 200;
const TIMING_CONFIG = {
  duration: ANIMATION_DURATION,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export function AlarmsHeader({
  title,
  editLabel,
  doneLabel,
  isEditMode,
  onEditPress,
  showEdit = true,
}: AlarmsHeaderProps) {
  const insets = useSafeAreaInsets();

  // Animation progress (0 = edit, 1 = done)
  const progress = useSharedValue(isEditMode ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isEditMode ? 1 : 0, TIMING_CONFIG);
  }, [isEditMode, progress]);

  // Animated style for Edit label (fades out when entering edit mode)
  const editLabelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 1 - progress.value * 0.1 }, { translateY: progress.value * -8 }],
    position: 'absolute' as const,
  }));

  // Animated style for Done label (fades in when entering edit mode)
  const doneLabelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.9 + progress.value * 0.1 }, { translateY: (1 - progress.value) * 8 }],
  }));

  // Dynamic style based on safe area - must use useMemo to satisfy no-inline-styles
  const headerStyle = useMemo(() => ({ paddingTop: insets.top + 12 }), [insets.top]);

  return (
    <View
      className="bg-background-light/95 px-6 pb-10 backdrop-blur-sm dark:bg-background-dark/95"
      style={headerStyle}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </Text>
        {showEdit ? (
          <Pressable
            accessibilityRole="button"
            className="relative rounded-lg px-2 py-1 active:bg-primary-500/10"
            onPress={onEditPress}
          >
            {/* Container to hold both labels for crossfade */}
            <View className="relative min-w-[48px] items-center justify-center">
              {/* Edit label */}
              <Animated.View style={editLabelAnimatedStyle}>
                <Text className="text-lg font-semibold text-primary-500">{editLabel}</Text>
              </Animated.View>
              {/* Done label */}
              <Animated.View style={doneLabelAnimatedStyle}>
                <Text className="text-lg font-semibold text-primary-500">{doneLabel}</Text>
              </Animated.View>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
