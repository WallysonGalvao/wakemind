import React, { useState } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { AlarmCard } from '@/components/alarms/alarm-card';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { Text } from '@/components/ui/text';
import { MOCK_ALARMS } from '@/data/alarms';
import type { Alarm } from '@/types/alarm';

export default function AlarmsScreen() {
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>(MOCK_ALARMS);

  const handleToggleAlarm = (id: string, value: boolean) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === id ? { ...alarm, isEnabled: value } : alarm))
    );
  };

  const handleNewAlarm = () => {
    // TODO: Navigate to create alarm screen
    console.log('New alarm pressed');
  };

  return (
    <View className="flex-1 bg-background-dark">
      {/* Header */}
      <View className="bg-background-dark/95 px-6 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-extrabold tracking-tight text-white">Your Alarms</Text>
          <Pressable
            accessibilityRole="button"
            className="rounded-lg px-2 py-1 active:bg-primary-500/10"
          >
            <Text className="text-lg font-semibold text-primary-500">Edit</Text>
          </Pressable>
        </View>
      </View>

      {/* Alarm List */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 140, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {alarms.map((alarm) => (
          <AlarmCard key={alarm.id} alarm={alarm} onToggle={handleToggleAlarm} />
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton label="New Alarm" icon="add" onPress={handleNewAlarm} />

      {/* Background Gradient Effects */}
      <View className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full">
        <View
          className="absolute -right-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary-500/5"
          style={{ filter: 'blur(120px)' }}
        />
        <View
          className="absolute -left-[10%] top-[40%] h-[300px] w-[300px] rounded-full bg-primary-500/5"
          style={{ filter: 'blur(80px)' }}
        />
      </View>
    </View>
  );
}
