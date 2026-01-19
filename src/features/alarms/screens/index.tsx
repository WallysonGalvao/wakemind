import React, { useCallback, useMemo, useState } from 'react';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  Layout,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AlarmCard } from '../components/alarm-card';
import { AlarmsHeader } from '../components/alarms-header';
import { EmptyState } from '../components/empty-state';

import { AnalyticsEvents } from '@/analytics';
import { FloatingActionButton } from '@/components/floating-action-button';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import * as alarmsDb from '@/db/functions/alarms';
import { useAlarms } from '@/hooks/use-alarms';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Alarm } from '@/types/alarm';

const AnimatedFlatList = Animated.FlatList<Alarm>;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Threshold for when blur effect starts appearing
const SCROLL_THRESHOLD = 10;
const BLUR_TRANSITION_RANGE = 30;

function ItemSeparator() {
  return <View className="h-4" />;
}

export default function AlarmsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { sortedAlarms, isLoading, refetch } = useAlarms();

  // Analytics tracking
  useAnalyticsScreen('Alarms');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Scroll position tracking
  const scrollY = useSharedValue(0);

  // Use grayscale image in dark mode, colored in light mode
  const sunriseImage =
    colorScheme === 'dark'
      ? require('@/assets/images/sunrise-grayscale.png')
      : require('@/assets/images/sunrise.png');

  const hasAlarms = sortedAlarms.length > 0;

  // Calculate header height (title + safe area + padding)
  const headerHeight = useMemo(() => insets.top + 12 + 40 + 30, [insets.top]); // paddingTop + title height + bottom padding

  const handleToggleAlarm = useCallback(
    async (id: string) => {
      const alarm = sortedAlarms.find((a) => a.id === id);
      if (alarm) {
        const newState = !alarm.isEnabled;
        AnalyticsEvents.alarmToggled(id, newState);
      }
      await alarmsDb.toggleAlarm(id);
      refetch();
    },
    [sortedAlarms, refetch]
  );

  const handleDeleteAlarm = useCallback(
    async (id: string) => {
      AnalyticsEvents.alarmDeleted(id);
      await alarmsDb.deleteAlarm(id);
      refetch();
      // If no more alarms, exit edit mode
      if (sortedAlarms.length <= 1) {
        setIsEditMode(false);
      }
    },
    [refetch, sortedAlarms.length]
  );

  const handleNewAlarm = useCallback(() => {
    router.push('/alarm/create-alarm');
  }, [router]);

  const handleEditAlarm = useCallback(
    (id: string) => {
      router.push(`/alarm/edit-alarm?alarmId=${id}`);
    },
    [router]
  );

  const handleEditPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditMode((prev) => !prev);
  }, []);

  // DEBUG: Function to test alarm trigger screen with mock data
  const handleTestAlarmTrigger = useCallback(() => {
    // Get first alarm or create mock data
    const testAlarm = sortedAlarms[0];
    const mockParams = testAlarm
      ? {
          alarmId: testAlarm.id,
          time: testAlarm.time,
          period: testAlarm.period,
          challenge: testAlarm.challenge,
          challengeIcon: testAlarm.challengeIcon,
        }
      : {
          alarmId: 'mock-alarm-id',
          time: '07:30',
          period: 'AM',
          challenge: 'Math Challenge',
          challengeIcon: 'calculate',
        };

    router.push({
      pathname: '/alarm/trigger',
      params: mockParams,
    });
  }, [router, sortedAlarms]);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Blur opacity animation based on scroll
  const blurAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD, SCROLL_THRESHOLD + BLUR_TRANSITION_RANGE],
      [0, 1],
      'clamp'
    );
    return { opacity };
  });

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Haptic feedback on refresh
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await refetch();

    setIsRefreshing(false);
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [refetch]);

  const keyExtractor = useCallback((item: Alarm) => item.id, []);

  // Content padding to account for fixed header
  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: hasAlarms ? headerHeight : 0,
      paddingHorizontal: 16,
      paddingBottom: 144,
    }),
    [hasAlarms, headerHeight]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Alarm; index: number }) => (
      <AlarmCard
        alarm={item}
        onToggle={handleToggleAlarm}
        onPress={handleEditAlarm}
        onDelete={handleDeleteAlarm}
        isEditMode={isEditMode}
        index={index}
      />
    ),
    [handleToggleAlarm, handleEditAlarm, handleDeleteAlarm, isEditMode]
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
        <AnimatedFlatList
          data={sortedAlarms}
          keyExtractor={keyExtractor}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          extraData={isEditMode}
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

      {/* Fixed Header with Blur Effect */}
      {hasAlarms ? (
        <View style={[styles.fixedHeader, { height: headerHeight }]} pointerEvents="box-none">
          {/* Background layer - semi-transparent solid color */}
          <View
            className="absolute inset-0 bg-background-light/80 dark:bg-background-dark/80"
            pointerEvents="none"
          />
          {/* Blur layer - appears on scroll */}
          <AnimatedBlurView
            intensity={15}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={[styles.blurLayer, blurAnimatedStyle]}
            pointerEvents="none"
          />
          {/* Header content */}
          <View className="flex-1" pointerEvents="box-none">
            <AlarmsHeader
              title={t('alarms.title')}
              editLabel={t('alarms.edit')}
              doneLabel={t('alarms.done')}
              isEditMode={isEditMode}
              onEditPress={handleEditPress}
            />
          </View>
        </View>
      ) : null}

      {/* Floating Action Button - hidden in edit mode */}
      {hasAlarms && !isEditMode ? (
        <FloatingActionButton label={t('alarms.newAlarm')} icon="add" onPress={handleNewAlarm} />
      ) : null}

      {/* DEBUG: Test Alarm Trigger Button - Remove in production */}
      {__DEV__ ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleTestAlarmTrigger}
          className="absolute bottom-6 left-6 h-14 w-14 items-center justify-center rounded-full bg-orange-500"
          style={{
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <MaterialSymbol name="notifications_active" size={24} className="text-white" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
