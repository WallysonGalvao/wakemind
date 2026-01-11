import React, { useMemo } from 'react';

import { cssInterop } from 'nativewind';

import { Platform, type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';

// Configure NativeWind to accept className on Text component
cssInterop(Text, {
  className: {
    target: 'style',
  },
});

/**
 * Material Symbols icon names with autocomplete support.
 * Add new icon names here as needed.
 * @see https://fonts.google.com/icons for full list
 */
export type MaterialSymbolName =
  // Alarm & Time
  | 'alarm'
  | 'alarm_add'
  | 'alarm_off'
  | 'alarm_on'
  | 'add_alarm'
  | 'schedule'
  | 'snooze'
  | 'timer'
  | 'timer_off'
  | 'access_time'
  | 'hourglass_empty'
  | 'hourglass_full'
  // Navigation & Actions
  | 'arrow_back'
  | 'arrow_forward'
  | 'chevron_left'
  | 'chevron_right'
  | 'close'
  | 'menu'
  | 'more_vert'
  | 'more_horiz'
  | 'expand_more'
  | 'expand_less'
  // Status & Feedback
  | 'check'
  | 'check_circle'
  | 'cancel'
  | 'error'
  | 'warning'
  | 'info'
  | 'help'
  | 'done'
  | 'done_all'
  // Common Actions
  | 'add'
  | 'remove'
  | 'delete'
  | 'edit'
  | 'save'
  | 'refresh'
  | 'search'
  | 'settings'
  | 'share'
  | 'copy'
  | 'send'
  | 'replay'
  | 'backspace'
  // Notifications
  | 'notifications'
  | 'notifications_active'
  | 'notifications_off'
  | 'do_not_disturb_on'
  | 'do_not_disturb_off'
  // Communication
  | 'mail'
  | 'chat'
  | 'message'
  | 'support_agent'
  // Security & Privacy
  | 'shield'
  | 'shield_lock'
  | 'verified_user'
  | 'lock'
  | 'lock_open'
  | 'fingerprint'
  | 'block'
  // Media
  | 'play_arrow'
  | 'pause'
  | 'stop'
  | 'volume_up'
  | 'volume_off'
  | 'mic'
  | 'mic_off'
  // UI Elements
  | 'circle'
  | 'star'
  | 'star_border'
  | 'favorite'
  | 'favorite_border'
  | 'lightbulb'
  | 'bolt'
  // User
  | 'person'
  | 'person_add'
  | 'group'
  | 'account_circle'
  // Misc
  | 'home'
  | 'language'
  | 'translate'
  | 'dark_mode'
  | 'light_mode'
  | 'visibility'
  | 'visibility_off'
  // Allow any string for icons not in the list
  | (string & {});

export interface MaterialSymbolProps {
  /** Icon name from Material Symbols (e.g., 'schedule', 'add_alarm', 'settings') */
  name: MaterialSymbolName;
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
