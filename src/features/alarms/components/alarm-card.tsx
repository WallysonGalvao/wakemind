import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Pressable, useColorScheme, View } from 'react-native';

import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import type { Alarm } from '@/types/alarm';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  index?: number;
}

const STAGGER_DELAY = 100;

export function AlarmCard({ alarm, onToggle, index = 0 }: AlarmCardProps) {
  const isActive = alarm.isEnabled;
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);

  // Get icon color based on theme and active state
  const getIconColor = () => {
    if (colorScheme === 'dark') {
      return isActive ? '#64748b' : '#475569';
    }
    return isActive ? '#64748b' : '#94a3b8';
  };

  const trackColor = {
    false: colorScheme === 'dark' ? '#475569' : '#cbd5e1',
    true: '#135bec',
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleToggle = () => {
    // Haptic feedback on toggle
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(alarm.id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Staggered entry animation
  const enteringAnimation = FadeInDown.delay(index * STAGGER_DELAY)
    .duration(400)
    .easing(Easing.out(Easing.cubic));

  return (
    <Pressable accessibilityRole="button" onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        entering={enteringAnimation}
        style={[
          animatedStyle,
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          },
        ]}
        className={`rounded-2xl border p-5 ${
          isActive
            ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-[#1a2230]'
            : 'border-slate-100 bg-white/50 dark:border-slate-800/50 dark:bg-[#1a2230]/50'
        }`}
      >
        <View className="flex-row items-center justify-between">
          {/* Left Side: Time and Info */}
          <View className="flex-1 gap-1">
            {/* Time Display */}
            <View className="flex-row items-baseline gap-2">
              <Text
                className={`text-5xl font-bold tracking-tight ${
                  isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {alarm.time}
              </Text>
              <Text
                className={`text-xl font-medium ${
                  isActive
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-400 dark:text-slate-600'
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
                    ? 'text-slate-600 dark:text-slate-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {alarm.challenge}
                <Text
                  className={
                    isActive
                      ? 'text-slate-400 dark:text-slate-600'
                      : 'text-slate-300 dark:text-slate-700'
                  }
                >
                  {' • '}
                </Text>
                {alarm.schedule}
              </Text>
            </View>
          </View>

          {/* Right Side: Toggle Switch */}
          <View className="pl-4">
            <Switch
              value={alarm.isEnabled}
              onValueChange={handleToggle}
              trackColor={trackColor}
              thumbColor="#ffffff"
              size="lg"
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
