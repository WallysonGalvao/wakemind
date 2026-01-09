import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Platform, Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { AlarmScheduler } from '@/services/alarm-scheduler';
import { useAlarmsStore } from '@/stores/use-alarms-store';

export default function AlarmTriggerScreen() {
  const params = useLocalSearchParams<{
    alarmId?: string;
    time?: string;
    period?: string;
    challenge?: string;
    challengeIcon?: string;
  }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const soundRef = useRef<Audio.Sound | null>(null);
  const getAlarmById = useAlarmsStore((state) => state.getAlarmById);

  const alarm = useMemo(() => {
    if (params.alarmId) {
      return getAlarmById(params.alarmId);
    }
    return undefined;
  }, [params.alarmId, getAlarmById]);

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // Start animations
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 1500 }), withTiming(0.3, { duration: 1500 })),
      -1,
      true
    );
  }, [pulseScale, glowOpacity]);

  // Animated styles
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Keep screen awake and play sound
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        await activateKeepAwakeAsync('alarm-trigger');

        // Start vibration pattern
        if (Platform.OS !== 'web') {
          const vibrate = async () => {
            if (!isMounted) return;
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setTimeout(vibrate, 2000);
          };
          vibrate();
        }

        // Load and play alarm sound
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../../../assets/sounds/alarm_sound.wav'),
          { isLooping: true, volume: 1.0 }
        );

        if (isMounted) {
          soundRef.current = sound;
          await sound.playAsync();
        } else {
          await sound.unloadAsync();
        }
      } catch (error) {
        console.error('[AlarmTriggerScreen] Setup error:', error);
      }
    };

    setup();

    return () => {
      isMounted = false;
      deactivateKeepAwake('alarm-trigger');
      if (soundRef.current) {
        void soundRef.current.stopAsync().then(() => {
          return soundRef.current?.unloadAsync();
        });
      }
    };
  }, []);

  const stopAlarm = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const handleSnooze = useCallback(async () => {
    await stopAlarm();

    if (alarm) {
      await AlarmScheduler.snoozeAlarm(alarm, 5);
    }

    router.back();
  }, [alarm, stopAlarm]);

  const handleDismiss = useCallback(async () => {
    await stopAlarm();

    if (alarm) {
      await AlarmScheduler.dismissAlarm(alarm);
    }

    // Navigate to challenge screen (TODO: implement challenge navigation)
    router.back();
  }, [alarm, stopAlarm]);

  const containerStyle = useMemo(
    () => ({
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }),
    [insets.top, insets.bottom]
  );

  // Current time display
  const displayTime = params.time || '00:00';
  const displayPeriod = params.period || 'AM';
  const challengeName = params.challenge || t('alarms.title');

  return (
    <View className="flex-1 bg-slate-900" style={containerStyle}>
      <View className="flex-1 items-center justify-center px-8">
        {/* Glow effect */}
        <Animated.View
          className="absolute h-80 w-80 rounded-full bg-primary-500"
          style={glowAnimatedStyle}
        />

        {/* Time display */}
        <Animated.View className="items-center" style={pulseAnimatedStyle}>
          <Text className="text-8xl font-bold text-white">{displayTime}</Text>
          <Text className="text-3xl font-medium text-slate-300">{displayPeriod}</Text>
        </Animated.View>

        {/* Challenge info */}
        <View className="mt-12 items-center">
          <View className="mb-4 rounded-full bg-slate-800 p-4">
            <MaterialSymbol name={params.challengeIcon || 'alarm'} size={32} color="#94a3b8" />
          </View>
          <Text className="text-lg text-slate-400">{challengeName}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View className="gap-4 px-8 pb-8">
        {/* Dismiss button - primary action */}
        <Pressable
          accessibilityRole="button"
          onPress={handleDismiss}
          className="items-center justify-center rounded-2xl bg-primary-500 py-5"
        >
          <Text className="text-lg font-semibold text-white">{t('alarmTrigger.dismiss')}</Text>
        </Pressable>

        {/* Snooze button - secondary action */}
        <Pressable
          accessibilityRole="button"
          onPress={handleSnooze}
          className="items-center justify-center rounded-2xl bg-slate-800 py-4"
        >
          <View className="flex-row items-center gap-2">
            <MaterialSymbol name="snooze" size={20} color="#94a3b8" />
            <Text className="text-base font-medium text-slate-400">{t('alarmTrigger.snooze')}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
