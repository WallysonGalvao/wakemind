import React, { useCallback, useState } from 'react';

import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { Pressable, useColorScheme, View } from 'react-native';

import { AlarmCard } from '@/components/alarms/alarm-card';
import { AlarmsHeader } from '@/components/alarms/alarms-header';
import { EmptyState } from '@/components/alarms/empty-state';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { MaterialSymbol } from '@/components/common/material-symbol';
import { Text } from '@/components/ui/text';
import type { Alarm } from '@/types/alarm';

function ItemSeparator() {
  return <View className="h-4" />;
}

export default function AlarmsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Use grayscale image in dark mode, colored in light mode
  const sunriseImage =
    colorScheme === 'dark'
      ? require('@/assets/images/sunrise-grayscale.png')
      : require('@/assets/images/sunrise.png');

  const hasAlarms = alarms.length > 0;

  const handleToggleAlarm = useCallback((id: string, value: boolean) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === id ? { ...alarm, isEnabled: value } : alarm))
    );
  }, []);

  const handleNewAlarm = () => {
    // TODO: Navigate to create alarm screen
    console.log('New alarm pressed');
  };

  const handleEditPress = () => {
    // TODO: Handle edit mode
    console.log('Edit pressed');
  };

  const keyExtractor = useCallback((item: Alarm) => item.id, []);

  const renderHeader = useCallback(() => {
    return (
      <AlarmsHeader
        title={t('alarms.title')}
        editLabel={t('alarms.edit')}
        onEditPress={handleEditPress}
      />
    );
  }, [t]);

  const renderItem = useCallback(
    ({ item }: { item: Alarm }) => <AlarmCard alarm={item} onToggle={handleToggleAlarm} />,
    [handleToggleAlarm]
  );

  const renderEmpty = useCallback(() => {
    return (
      <EmptyState
        title={t('alarms.emptyTitle')}
        description={t('alarms.emptyDescription')}
        image={sunriseImage}
      >
        <Pressable
          onPress={handleNewAlarm}
          className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/25 active:scale-[0.98]"
          accessibilityRole="button"
        >
          <MaterialSymbol name="add_alarm" size={24} color="#ffffff" />
          <Text className="text-lg font-bold text-white">{t('alarms.setFirstAlarm')}</Text>
        </Pressable>
      </EmptyState>
    );
  }, [t, sunriseImage]);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <FlashList
        data={alarms}
        keyExtractor={keyExtractor}
        ListHeaderComponent={hasAlarms ? renderHeader : null}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerClassName="px-4 pb-36"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
      />

      {/* Floating Action Button */}
      {hasAlarms ? (
        <FloatingActionButton label={t('alarms.newAlarm')} icon="add" onPress={handleNewAlarm} />
      ) : null}
    </View>
  );
}
