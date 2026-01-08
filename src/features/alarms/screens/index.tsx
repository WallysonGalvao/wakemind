import React, { useCallback, useState } from 'react';

import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

import { Pressable, RefreshControl, useColorScheme, View } from 'react-native';

import { AlarmCard } from '../components/alarm-card';
import { AlarmsHeader } from '../components/alarms-header';
import { EmptyState } from '../components/empty-state';

import { FloatingActionButton } from '@/components/floating-action-button';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import type { Alarm } from '@/types/alarm';

function ItemSeparator() {
  return <View className="h-4" />;
}

export default function AlarmsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const alarms = useAlarmsStore((state) => state.alarms);
  const toggleAlarm = useAlarmsStore((state) => state.toggleAlarm);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use grayscale image in dark mode, colored in light mode
  const sunriseImage =
    colorScheme === 'dark'
      ? require('@/assets/images/sunrise-grayscale.png')
      : require('@/assets/images/sunrise.png');

  const hasAlarms = alarms.length > 0;

  const handleToggleAlarm = useCallback(
    (id: string) => {
      toggleAlarm(id);
    },
    [toggleAlarm]
  );

  const handleNewAlarm = useCallback(() => {
    console.log('handleNewAlarm');
    router.push('/alarm/new-alarm');
  }, [router]);

  const handleEditPress = () => {
    // TODO: Handle edit mode
    console.log('Edit pressed');
  };

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Haptic feedback on refresh
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate refresh delay (in real app, would sync with backend)
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsRefreshing(false);
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

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
    ({ item, index }: { item: Alarm; index: number }) => (
      <AlarmCard alarm={item} onToggle={handleToggleAlarm} index={index} />
    ),
    [handleToggleAlarm]
  );

  const renderEmpty = useCallback(() => {
    return (
      <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut.duration(300)}>
        <EmptyState
          title={t('alarms.emptyTitle')}
          description={t('alarms.emptyDescription')}
          image={sunriseImage}
        >
          <Pressable
            onPress={handleNewAlarm}
            className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary-500 active:scale-[0.98]"
            accessibilityRole="button"
          >
            <MaterialSymbol name="add_alarm" size={24} className="text-white" />
            <Text className="text-lg font-bold text-white">{t('alarms.setFirstAlarm')}</Text>
          </Pressable>
        </EmptyState>
      </Animated.View>
    );
  }, [t, sunriseImage, handleNewAlarm]);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Animated.View className="flex-1" layout={Layout.duration(300)}>
        <FlashList
          data={alarms}
          keyExtractor={keyExtractor}
          ListHeaderComponent={hasAlarms ? renderHeader : null}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerClassName="px-4 pb-36"
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colorScheme === 'dark' ? '#64748b' : '#94a3b8'}
              colors={['#135bec']}
              progressBackgroundColor={colorScheme === 'dark' ? '#1a2230' : '#ffffff'}
            />
          }
        />
      </Animated.View>

      {/* Floating Action Button */}
      {hasAlarms ? (
        <FloatingActionButton label={t('alarms.newAlarm')} icon="add" onPress={handleNewAlarm} />
      ) : null}
    </View>
  );
}
