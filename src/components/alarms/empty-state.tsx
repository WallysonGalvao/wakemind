import React, { useMemo } from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';

import { Dimensions, View } from 'react-native';

import { Text } from '../ui/text';

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: ImageSource;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, image, children }: EmptyStateProps) {
  const screenHeight = Dimensions.get('window').height;

  // Image styles
  const imageStyle = useMemo(
    () => ({
      width: '100%' as const,
      height: '100%' as const,
    }),
    []
  );

  // Grayscale effect overlay (simulates grayscale + brightness 0.8)
  const grayscaleOverlayStyle = useMemo(
    () => ({
      backgroundColor: 'rgba(0, 0, 0, 0.2)' as const,
      mixBlendMode: 'multiply' as const,
    }),
    []
  );

  // Contrast boost overlay
  const contrastOverlayStyle = useMemo(
    () => ({
      backgroundColor: 'rgba(255, 255, 255, 0.1)' as const,
      mixBlendMode: 'overlay' as const,
    }),
    []
  );

  return (
    <View className="items-center justify-center px-6" style={{ minHeight: screenHeight * 0.8 }}>
      {/* Abstract Visual Representation */}
      <View className="relative mb-10">
        {/* Decorative Glow */}
        {/* <View className="absolute -inset-4 rounded-full bg-primary-500/20 opacity-50 blur-2xl" /> */}

        {/* Icon Container */}
        <View className="relative h-48 w-48 items-center justify-center overflow-hidden rounded-full">
          {image ? (
            <>
              <Image
                source={image}
                className="h-full w-full"
                contentFit="cover"
                transition={200}
                accessibilityIgnoresInvertColors
                style={imageStyle}
              />
            </>
          ) : null}
        </View>

        {/* Floating Icon Badge */}
        <View className="dark:bg-surface-dark absolute bottom-2 right-2 rounded-full border border-slate-100 bg-white p-3 shadow-lg dark:border-slate-800">
          <MaterialIcons name="schedule" size={28} color="#135bec" />
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
