import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Audio } from 'expo-av';
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

import { Pressable, View } from 'react-native';

import {
  LogicChallengeComponent,
  MathChallengeComponent,
  MemoryChallengeComponent,
} from '../components/challenges';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { getToneAudioSource } from '@/constants/alarm-tones';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { AlarmScheduler } from '@/services/alarm-scheduler';
import { AnalyticsEvents } from '@/services/analytics';
import { VibrationService } from '@/services/vibration-service';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import { useSettingsStore } from '@/stores/use-settings-store';
import { BackupProtocolId, ChallengeType, DifficultyLevel } from '@/types/alarm-enums';

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
  const alarmToneId = useSettingsStore((state) => state.alarmToneId);
  const vibrationPattern = useSettingsStore((state) => state.vibrationPattern);
  const preventAutoLock = useSettingsStore((state) => state.preventAutoLock);
  const snoozeProtection = useSettingsStore((state) => state.snoozeProtection);

  // Get alarm data first to use its difficulty and challenge type
  const alarm = useMemo(() => {
    if (params.alarmId) {
      return getAlarmById(params.alarmId);
    }
    return undefined;
  }, [params.alarmId, getAlarmById]);

  // Get challenge type and difficulty from alarm
  const challengeType = alarm?.challengeType ?? ChallengeType.MATH;
  const difficulty = alarm?.difficulty ?? DifficultyLevel.MEDIUM;

  // Check if snooze protocol is enabled
  const isSnoozeEnabled = useMemo(() => {
    return (
      alarm?.protocols?.some(
        (protocol) => protocol.id === BackupProtocolId.SNOOZE && protocol.enabled
      ) ?? false
    );
  }, [alarm?.protocols]);

  // Check if wake check protocol is enabled
  const isWakeCheckEnabled = useMemo(() => {
    return (
      alarm?.protocols?.some(
        (protocol) => protocol.id === BackupProtocolId.WAKE_CHECK && protocol.enabled
      ) ?? false
    );
  }, [alarm?.protocols]);

  // Challenge state
  const [attempt, setAttempt] = useState(1);
  const maxAttempts = 3;

  // Track screen view
  useAnalyticsScreen('AlarmTrigger');

  // Track alarm triggered
  useEffect(() => {
    if (params.alarmId && params.time) {
      AnalyticsEvents.alarmTriggered(params.alarmId, params.time);
      AnalyticsEvents.challengeStarted(challengeType, difficulty);
    }
  }, [params.alarmId, params.time, challengeType, difficulty]);

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const progressWidth = useSharedValue(0);

  // Start animations
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.02, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 1500 }), withTiming(0.4, { duration: 1500 })),
      -1,
      true
    );

    // Efficiency timer animation (30 seconds)
    progressWidth.value = withTiming(100, { duration: 30000 });
  }, [pulseScale, glowOpacity, progressWidth]);

  // Animated styles
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Keep screen awake and play sound
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        // Keep screen awake if enabled in settings
        if (preventAutoLock) {
          await activateKeepAwakeAsync('alarm-trigger');
        }

        // Start vibration pattern from settings
        VibrationService.start(vibrationPattern);

        // Load and play alarm sound
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        // Get the selected tone from settings
        const audioSource = getToneAudioSource(alarmToneId);

        const { sound } = await Audio.Sound.createAsync(audioSource, {
          isLooping: true,
          volume: 1.0,
        });

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
      if (preventAutoLock) {
        deactivateKeepAwake('alarm-trigger');
      }
      VibrationService.stop();
      if (soundRef.current) {
        void soundRef.current.stopAsync().then(() => {
          return soundRef.current?.unloadAsync();
        });
      }
    };
  }, [alarmToneId, vibrationPattern, preventAutoLock]);

  const stopAlarm = useCallback(async () => {
    VibrationService.stop();
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const handleSnooze = useCallback(async () => {
    await stopAlarm();

    if (alarm) {
      // Track snooze
      AnalyticsEvents.alarmSnoozed(alarm.id);
      await AlarmScheduler.snoozeAlarm(alarm, 5);
    }

    router.back();
  }, [alarm, stopAlarm]);

  const handleDismiss = useCallback(async () => {
    await stopAlarm();

    if (alarm) {
      // Track alarm dismissed with challenge info
      AnalyticsEvents.alarmDismissed(alarm.id, challengeType, attempt);
      AnalyticsEvents.challengeCompleted(challengeType, difficulty, attempt);
      await AlarmScheduler.dismissAlarm(alarm);

      // Schedule wake check if protocol is enabled
      if (isWakeCheckEnabled) {
        await AlarmScheduler.scheduleWakeCheck(alarm);
      }
    }

    router.back();
  }, [alarm, stopAlarm, isWakeCheckEnabled]);

  // Challenge callbacks
  const handleChallengeSuccess = useCallback(async () => {
    await handleDismiss();
  }, [handleDismiss]);

  const handleChallengeAttempt = useCallback(
    (correct: boolean) => {
      if (!correct && attempt < maxAttempts) {
        setAttempt((prev) => prev + 1);
      }
    },
    [attempt, maxAttempts]
  );

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

  // Render the appropriate challenge component based on challenge type
  const renderChallenge = () => {
    switch (challengeType) {
      case ChallengeType.MATH:
        return (
          <MathChallengeComponent
            difficulty={difficulty}
            onSuccess={handleChallengeSuccess}
            onAttempt={handleChallengeAttempt}
          />
        );
      case ChallengeType.MEMORY:
        return (
          <MemoryChallengeComponent
            difficulty={difficulty}
            onSuccess={handleChallengeSuccess}
            onAttempt={handleChallengeAttempt}
          />
        );
      case ChallengeType.LOGIC:
        return (
          <LogicChallengeComponent
            difficulty={difficulty}
            onSuccess={handleChallengeSuccess}
            onAttempt={handleChallengeAttempt}
          />
        );
      default:
        return (
          <MathChallengeComponent
            difficulty={difficulty}
            onSuccess={handleChallengeSuccess}
            onAttempt={handleChallengeAttempt}
          />
        );
    }
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark" style={containerStyle}>
      {/* Header with time and progress */}
      <View className="items-center px-6 pb-4 pt-6">
        <View className="mb-1 flex-row items-center gap-2">
          <Animated.View style={pulseAnimatedStyle}>
            <MaterialSymbol name="alarm_on" size={20} color="#3B82F6" />
          </Animated.View>
          <Text className="text-xs font-bold uppercase tracking-widest text-primary-500">
            {t('alarmTrigger.wakeUpProtocol')}
          </Text>
        </View>

        <View className="flex-row items-baseline">
          <Text className="text-7xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
            {displayTime}
          </Text>
          <Text className="ml-2 text-xl font-medium text-gray-500">{displayPeriod}</Text>
        </View>

        {/* Efficiency Timer */}
        <View className="mt-4 w-44 items-center gap-1">
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <Animated.View
              className="h-full rounded-full bg-primary-500"
              style={[progressAnimatedStyle, glowAnimatedStyle]}
            />
          </View>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-primary-500/80">
            {t('alarmTrigger.efficiencyTimer')}
          </Text>
        </View>
      </View>

      {/* Main Challenge Area */}
      {renderChallenge()}

      {/* Attempts indicator */}
      <View className="items-center py-2">
        <Text className="text-[10px] uppercase tracking-widest text-gray-600">
          {t('alarmTrigger.attempt', { current: attempt, max: maxAttempts })}
        </Text>
      </View>

      {/* Snooze Button - Only shown if snooze protocol is enabled AND snooze protection is OFF */}
      {isSnoozeEnabled && !snoozeProtection ? (
        <View className="px-6 pb-6">
          <Pressable
            accessibilityRole="button"
            onPress={handleSnooze}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 dark:bg-surface-dark"
          >
            <MaterialSymbol name="snooze" size={20} color="#6B7280" />
            <Text className="text-base font-medium text-gray-600 dark:text-gray-400">
              {t('alarmTrigger.snooze')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
