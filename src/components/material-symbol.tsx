import React, { useMemo } from 'react';

import { cssInterop } from 'nativewind';

import { Platform, type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';

// Configure NativeWind to accept className on Text component
cssInterop(Text, {
  className: {
    target: 'style',
  },
});

export interface MaterialSymbolProps {
  /** Icon name from Material Symbols (e.g., 'schedule', 'add_alarm', 'settings') */
  name: string;
  /** Icon size in pixels */
  size?: number;
  /** Icon color */
  color?: string;
  /** Additional styles for the icon */
  style?: StyleProp<TextStyle>;
  /** Tailwind CSS classes */
  className?: string;
}

// Baseline offset correction factor (font has slight vertical offset)
const BASELINE_OFFSET_FACTOR = 0.1;

/**
 * Material Symbols Rounded (Filled) icon component.
 * Uses the official Google Material Symbols font with FILL=1 for filled icons.
 *
 * NOTE: The font must be loaded in the root layout before using this component.
 * Use `useFonts` in _layout.tsx to load 'MaterialSymbolsRoundedFilled'.
 *
 * @see https://fonts.google.com/icons for icon names (use underscore format, e.g., 'add_alarm')
 */
export function MaterialSymbol({
  name,
  size = 24,
  color = '#000000',
  style,
  className,
}: MaterialSymbolProps) {
  // Calculate baseline offset based on size
  const baselineOffset = Math.round(size * BASELINE_OFFSET_FACTOR);

  const iconStyle = useMemo(
    () => ({
      fontSize: size,
      // Only apply color if className is not provided
      ...(className ? {} : { color }),
      lineHeight: size,
      // Apply baseline correction
      ...(Platform.OS === 'ios' ? { top: baselineOffset } : {}),
    }),
    [size, color, baselineOffset, className]
  );

  return (
    <Text
      style={[styles.icon, iconStyle, style]}
      className={className}
      accessibilityRole="image"
      accessibilityLabel={`${name} icon`}
      accessibilityHint={`${name} icon`}
    >
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontFamily: 'MaterialSymbolsRoundedFilled',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
