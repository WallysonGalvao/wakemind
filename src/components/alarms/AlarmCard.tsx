import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';

import { View } from 'react-native';

import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import type { Alarm } from '@/types/alarm';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, value: boolean) => void;
}

export function AlarmCard({ alarm, onToggle }: AlarmCardProps) {
  const isActive = alarm.isEnabled;

  return (
    <View
      className={`rounded-2xl border p-5 ${
        isActive ? 'border-outline-200 bg-background-50' : 'border-outline-100 bg-background-50/50'
      }`}
    >
      <View className="flex-row items-center justify-between">
        {/* Left Side: Time and Info */}
        <View className="flex-1 gap-1">
          {/* Time Display */}
          <View className="flex-row items-baseline gap-2">
            <Text
              className={`text-5xl font-bold tracking-tight ${
                isActive ? 'text-typography-900' : 'text-typography-400'
              }`}
            >
              {alarm.time}
            </Text>
            <Text
              className={`text-xl font-medium ${
                isActive ? 'text-typography-500' : 'text-typography-400'
              }`}
            >
              {alarm.period}
            </Text>
          </View>

          {/* Challenge and Schedule Info */}
          <View className="mt-1 flex-row items-center gap-2">
            <MaterialIcons
              name={alarm.challengeIcon as keyof typeof MaterialIcons.glyphMap}
              size={20}
              color={isActive ? '#64748b' : '#94a3b8'}
            />
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-typography-600' : 'text-typography-400'
              }`}
            >
              {alarm.challenge}
              <Text className={`${isActive ? 'text-typography-400' : 'text-typography-300'}`}>
                {' • '}
              </Text>
              {alarm.schedule}
            </Text>
          </View>
        </View>

        {/* Right Side: Toggle Switch */}
        <View className="pl-4">
          <Switch
            value={alarm.isEnabled}
            onValueChange={(value) => onToggle(alarm.id, value)}
            trackColor={{ false: '#cbd5e1', true: '#135bec' }}
            thumbColor="#ffffff"
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}
