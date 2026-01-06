import React, { useMemo } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, View } from 'react-native';

import { Text } from '../ui/text';

interface AlarmsHeaderProps {
  title: string;
  editLabel: string;
  onEditPress?: () => void;
  showEdit?: boolean;
}

export function AlarmsHeader({
  title,
  editLabel,
  onEditPress,
  showEdit = true,
}: AlarmsHeaderProps) {
  const insets = useSafeAreaInsets();

  // Dynamic style based on safe area - must use useMemo to satisfy no-inline-styles
  const headerStyle = useMemo(() => ({ paddingTop: insets.top + 12 }), [insets.top]);

  return (
    <View
      className="bg-background-light/95 px-6 pb-10 backdrop-blur-sm dark:bg-background-dark/95"
      style={headerStyle}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </Text>
        {showEdit ? (
          <Pressable
            accessibilityRole="button"
            className="rounded-lg px-2 py-1 active:bg-primary-500/10"
            onPress={onEditPress}
          >
            <Text className="text-lg font-semibold text-primary-500">{editLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
