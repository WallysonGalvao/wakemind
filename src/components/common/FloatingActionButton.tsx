import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';

import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

interface FloatingActionButtonProps {
  label: string;
  icon?: string;
  onPress: () => void;
}

export function FloatingActionButton({ label, icon = 'add', onPress }: FloatingActionButtonProps) {
  return (
    <View className="absolute bottom-8 left-0 right-0 z-10 flex items-center">
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-full bg-primary-500 py-4 pl-5 pr-7 shadow-lg active:bg-primary-600"
        style={{
          shadowColor: '#135bec',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
          elevation: 8,
        }}
      >
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={28}
          color="#ffffff"
        />
        <Text className="text-lg font-bold tracking-tight text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
