import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';

import { Pressable, View, useColorScheme } from 'react-native';

import { Text } from '../ui/text';

interface SettingItemProps {
  icon: string;
  title: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export function SettingItem({
  icon,
  title,
  description,
  value,
  onPress,
  rightElement,
}: SettingItemProps) {
  const colorScheme = useColorScheme();
  const arrowColor = colorScheme === 'dark' ? '#64748b' : '#94a3b8';

  const content = (
    <View className="flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1a2230]">
      {/* Icon */}
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-500/10">
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={24}
          color="#135bec"
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-900 dark:text-white">{title}</Text>
        {description && (
          <Text className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</Text>
        )}
        {value && <Text className="mt-1 text-sm font-medium text-primary-500">{value}</Text>}
      </View>

      {/* Right Element or Arrow */}
      {rightElement || <MaterialIcons name="chevron-right" size={24} color={arrowColor} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}
