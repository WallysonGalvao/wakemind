import React from 'react';

import { Image, type ImageSource } from 'expo-image';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';

import { Dimensions, StyleSheet, View } from 'react-native';

import { MaterialSymbol } from '../common/material-symbol';
import { Text } from '../ui/text';

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: ImageSource;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, image, children }: EmptyStateProps) {
  const screenHeight = Dimensions.get('window').height;
  const glowSize = 280; // Size of the glow circle

  return (
    <View className="items-center justify-center px-6" style={{ minHeight: screenHeight * 0.8 }}>
      {/* Abstract Visual Representation */}
      <View className="relative mb-14">
        {/* Decorative Glow - Radial gradient from center to edges */}
        <View style={styles.glowContainer}>
          <Svg width={glowSize} height={glowSize} viewBox={`0 0 ${glowSize} ${glowSize}`}>
            <Defs>
              <RadialGradient
                id="glowGradient"
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
              >
                <Stop offset="0%" stopColor="#135bec" stopOpacity="0.35" />
                <Stop offset="40%" stopColor="#135bec" stopOpacity="0.2" />
                <Stop offset="70%" stopColor="#135bec" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#135bec" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={glowSize / 2}
              cy={glowSize / 2}
              r={glowSize / 2}
              fill="url(#glowGradient)"
            />
          </Svg>
        </View>

        {/* Icon Container */}
        <View className="relative h-48 w-48 items-center justify-center overflow-hidden rounded-full border-4 border-surface-light bg-black shadow-2xl dark:border-surface-dark">
          {image ? (
            <>
              <Image
                source={image}
                className="h-full w-full"
                contentFit="cover"
                transition={200}
                accessibilityIgnoresInvertColors
                style={styles.image}
              />
              {/* Overlay for mood effect */}
              <View className="absolute inset-0 bg-primary-500/10" />
            </>
          ) : null}
        </View>

        {/* Floating Icon Badge */}
        <View className="absolute bottom-2 right-2 items-center justify-center rounded-full border border-slate-100 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-surface-dark">
          <MaterialSymbol name="schedule" size={28} color="#135bec" />
        </View>
      </View>

      {/* Text Content */}
      <View className="mb-10 items-center gap-3">
        <Text className="text-center text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          {title}
        </Text>
        {description ? (
          <Text className="max-w-[280px] text-center text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </Text>
        ) : null}
      </View>

      {/* Action Content (optional) */}
      {children}
    </View>
  );
}

const IMAGE_SIZE = 192; // h-48 w-48 = 12rem = 192px

const styles = StyleSheet.create({
  glowContainer: {
    position: 'absolute',
    top: (IMAGE_SIZE - 280) / 2,
    left: (IMAGE_SIZE - 280) / 2,
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
