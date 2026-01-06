import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';

import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#135bec',
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          backgroundColor: isDark ? '#1a2230' : '#ffffff',
          borderTopColor: isDark ? '#334155' : '#e2e8f0',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.alarms'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="alarm" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
