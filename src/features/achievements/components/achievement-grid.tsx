/**
 * Achievement Grid Component
 * Displays achievements in a 2-column grid
 */

import React from 'react';

import { ActivityIndicator, View } from 'react-native';

import type { AchievementState } from '../types/achievement.types';
import { AchievementCard } from './achievement-card';

interface AchievementGridProps {
  achievements: AchievementState[];
  loading?: boolean;
  onAchievementPress?: (achievement: AchievementState) => void;
}

export function AchievementGrid({
  achievements,
  loading = false,
  onAchievementPress,
}: AchievementGridProps) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#3FA9F5" />
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-4">
      {achievements.map((achievement, index) => (
        <View key={achievement.achievement.id} className="w-[48%]">
          <AchievementCard
            achievement={achievement}
            onPress={onAchievementPress ? () => onAchievementPress(achievement) : undefined}
          />
        </View>
      ))}
    </View>
  );
}
