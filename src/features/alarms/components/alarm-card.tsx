import React, { useRef } from 'react';

import { MaterialIcons } from '@expo/vector-icons';

import { Animated, Pressable, useColorScheme, View } from 'react-native';

import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import type { Alarm } from '@/types/alarm';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, value: boolean) => void;
}

export function AlarmCard({ alarm, onToggle }: AlarmCardProps) {
  const isActive = alarm.isEnabled;
  const colorScheme = useColorScheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    Animated.spring(scaleAnim, {
      toValue: 0.99,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable accessibilityRole="button" onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className={`rounded-2xl border p-5 shadow-sm ${
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
              onValueChange={(value) => onToggle(alarm.id, value)}
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
