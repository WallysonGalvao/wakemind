import React from 'react';

import { useTranslation } from 'react-i18next';
import type { SharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

export function OnboardingItem({
  item,
  scrollX: _scrollX,
  index: _index,
  totalItems: _totalItems,
}: OnboardingItemProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#101622' : '#f6f6f8',
    iconBackground: isDark ? COLORS.brandPrimary + '33' : COLORS.brandPrimary + '1A',
    iconColor: COLORS.brandPrimary,
    titleColor: isDark ? COLORS.white : '#111827',
    highlightColor: COLORS.brandPrimary,
    fadedColor: isDark ? COLORS.gray[500] : COLORS.gray[400],
    bodyPrimaryColor: isDark ? '#d1d5db' : COLORS.gray[600],
    bodySecondaryColor: isDark ? COLORS.gray[500] : COLORS.gray[500],
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Abstract Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
          <MaterialSymbol name={item.icon} size={36} color={colors.iconColor} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          {item.titleLines.map((lineKey, lineIndex) => (
            <Text
              key={lineKey}
              style={[
                styles.titleText,
                { color: colors.titleColor },
                lineIndex === item.highlightedLineIndex && { color: colors.highlightColor },
                lineIndex === item.fadedLineIndex && { color: colors.fadedColor },
              ]}
            >
              {t(lineKey)}
            </Text>
          ))}
        </View>

        {/* Body */}
        <View style={styles.bodyContainer}>
          <Text style={[styles.bodyPrimary, { color: colors.bodyPrimaryColor }]}>
            {t(item.bodyPrimaryKey)}
          </Text>
          {item.bodySecondaryKey ? (
            <Text style={[styles.bodySecondary, { color: colors.bodySecondaryColor }]}>
              {t(item.bodySecondaryKey)}
            </Text>
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
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
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
    lineHeight: 42,
  },
  bodyContainer: {
    gap: 16,
  },
  bodyPrimary: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
    maxWidth: 320,
  },
  bodySecondary: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
});
