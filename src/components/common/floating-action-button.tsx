import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';

import { Pressable, useColorScheme, View } from 'react-native';

import { Text } from '@/components/ui/text';

interface FloatingActionButtonProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

export function FloatingActionButton({ label, icon = 'add', onPress }: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Different shadow styles for light/dark modes matching reference
  const shadowStyle = isDark
    ? {
        // Dark mode: blue glow effect
        shadowColor: '#135bec',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 8,
      }
    : {
        // Light mode: subtle black shadow
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 30,
        elevation: 8,
      };

  return (
    <View className="pointer-events-none absolute bottom-8 left-0 right-0 z-10 flex items-center">
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="pointer-events-auto flex-row items-center gap-3 rounded-full border border-white/10 bg-primary-500 py-4 pl-5 pr-7 active:scale-95 active:bg-primary-600"
        style={shadowStyle}
      >
        <MaterialIcons name={icon} size={28} color="#ffffff" />
        <Text className="text-lg font-bold tracking-tight text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
