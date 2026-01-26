import React from 'react';

import { View } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  color: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({ progress, color, height = 6, backgroundColor }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      className="overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      style={{
        height,
        backgroundColor: backgroundColor,
      }}
    >
      <View
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${clampedProgress}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
