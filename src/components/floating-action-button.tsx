import React from 'react';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useCustomShadow } from '@/hooks/use-shadow-style';
import { useIsDarkMode } from '@/hooks/use-theme';

interface FloatingActionButtonProps {
  label: string;
  icon?: string;
  onPress: () => void;
}

export function FloatingActionButton({ label, icon = 'add', onPress }: FloatingActionButtonProps) {
  const isDark = useIsDarkMode();

  // Different shadow styles for light/dark modes matching reference
  const shadowStyle = useCustomShadow({
    offset: { width: 0, height: 8 },
    opacity: isDark ? 0.2 : 0.12,
    radius: 30,
    elevation: 8,
    color: isDark ? 'rgba(19, 91, 236, 1)' : undefined,
  });

  return (
    <View className="pointer-events-box-none absolute bottom-8 left-0 right-0 z-10 flex items-center">
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-full border border-white/10 bg-primary-500 py-4 pl-5 pr-7 active:scale-95 active:bg-primary-600"
        style={shadowStyle}
      >
        <MaterialSymbol name={icon} size={28} className="text-white" />
        <Text className="text-lg font-bold tracking-tight text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
