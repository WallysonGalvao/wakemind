import React from 'react';

import { useTranslation } from 'react-i18next';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';

// ============================================================================
// Types
// ============================================================================

export interface OnboardingItemData {
  id: string;
  icon: string;
  titleKey: string;
  titleLines: string[];
  highlightedLineIndex?: number;
  fadedLineIndex?: number;
  bodyPrimaryKey: string;
  bodySecondaryKey?: string;
}

type OnboardingItemProps = {
  item: OnboardingItemData;
  scrollX: SharedValue<number>;
  index: number;
  totalItems: number;
};

// ============================================================================
// Main Component
// ============================================================================

export function OnboardingItem({ item, scrollX, index: _index, totalItems }: OnboardingItemProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const rStyle = useAnimatedStyle(() => {
    const colors = [COLORS.brandPrimary, '#1E40AF', COLORS.brandPrimary];
    const inputRange = Array.from({ length: totalItems }, (_, i) => i * width);

    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      colors.slice(0, totalItems)
    );

    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          paddingTop: insets.top + 60,
        },
        rStyle,
      ]}
    >
      <View style={styles.content}>
        {/* Abstract Icon */}
        <View style={styles.iconContainer}>
          <MaterialSymbol name={item.icon} size={36} color={COLORS.white} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          {item.titleLines.map((lineKey, lineIndex) => (
            <Text
              key={lineKey}
              style={[
                styles.titleText,
                lineIndex === item.highlightedLineIndex && styles.highlightedText,
                lineIndex === item.fadedLineIndex && styles.fadedText,
              ]}
            >
              {t(lineKey)}
            </Text>
          ))}
        </View>

        {/* Body */}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyPrimary}>{t(item.bodyPrimaryKey)}</Text>
          {item.bodySecondaryKey ? (
            <Text style={styles.bodySecondary}>{t(item.bodySecondaryKey)}</Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.white + '26', // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  titleContainer: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 42,
  },
  highlightedText: {
    color: COLORS.blue[300], // Light blue highlight
  },
  fadedText: {
    opacity: 0.5,
  },
  bodyContainer: {
    gap: 16,
  },
  bodyPrimary: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 26,
    maxWidth: 320,
  },
  bodySecondary: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.7,
    lineHeight: 24,
    maxWidth: 320,
  },
});
