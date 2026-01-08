import React from 'react';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

interface ProtocolToggleProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ProtocolToggle({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  isEnabled,
  onToggle,
  disabled = false,
}: ProtocolToggleProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onToggle}
      className={`flex-row items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-transparent dark:bg-surface-dark ${
        disabled ? 'opacity-60' : ''
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: isEnabled, disabled }}
    >
      <View className="flex-row items-center gap-3">
        <View className={`flex size-10 items-center justify-center rounded-full ${iconBgColor}`}>
          <MaterialSymbol name={icon} size={24} color={iconColor} />
        </View>
        <View>
          <Text className="font-semibold text-slate-900 dark:text-white">{title}</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">{description}</Text>
        </View>
      </View>

      {/* Toggle switch */}
      <View
        className={`relative h-6 w-11 rounded-full ${
          isEnabled ? 'bg-brand-primary/30' : 'bg-slate-200 dark:bg-surface-highlight'
        }`}
      >
        <View
          className={`absolute top-1 h-4 w-4 rounded-full ${
            isEnabled ? 'right-1 bg-brand-primary' : 'left-1 bg-slate-400 dark:bg-slate-500'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        />
      </View>
    </Pressable>
  );
}
