import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AudioSource } from 'expo-audio';
import { useAudioPlayer } from 'expo-audio';
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

import { BackHandler, Pressable, View } from 'react-native';

import {
  LogicChallengeComponent,
  MathChallengeComponent,
  MemoryChallengeComponent,
} from '../components/challenges';

import { AnalyticsEvents } from '@/analytics';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { getToneAudioSource } from '@/constants/alarm-tones';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { AlarmScheduler } from '@/services/alarm-scheduler';
import { VibrationService } from '@/services/vibration-service';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import { useSettingsStore } from '@/stores/use-settings-store';
import { BackupProtocolId, ChallengeType, DifficultyLevel } from '@/types/alarm-enums';

export default function AlarmTriggerScreen() {
  // Analytics tracking
  useAnalyticsScreen('Alarm Trigger');

  const params = useLocalSearchParams<{
    alarmId?: string;
    time?: string;
    period?: string;
    challenge?: string;
    challengeIcon?: string;
  }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const getAlarmById = useAlarmsStore((state) => state.getAlarmById);
  const alarmToneId = useSettingsStore((state) => state.alarmToneId);
  const player = useAudioPlayer(getToneAudioSource(alarmToneId) as AudioSource);
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

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const progressWidth = useSharedValue(0);

  // Start animations
  useEffect(() => {
    // Track challenge started
    AnalyticsEvents.challengeStarted(challengeType, difficulty);

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
  }, [pulseScale, glowOpacity, progressWidth, challengeType, difficulty]);

  // Block back button on Android and prevent navigation on iOS
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default back behavior
      return true;
    });

    return () => backHandler.remove();
  }, []);

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
    // Track alarm triggered
    if (alarm) {
      const displayTime = params.time || alarm.time || '00:00';
      AnalyticsEvents.alarmTriggered(alarm.id, displayTime);
    }

    const setup = async () => {
      try {
        // Keep screen awake if enabled in settings
        if (preventAutoLock) {
          await activateKeepAwakeAsync('alarm-trigger');
        }

        // Start vibration pattern from settings
        VibrationService.start(vibrationPattern);

        // Play alarm sound with expo-audio
        player.loop = true;
        player.volume = 1.0;
        player.play();
      } catch (error) {
        console.error('[AlarmTriggerScreen] Setup error:', error);
      }
    };

    setup();

    return () => {
      if (preventAutoLock) {
        deactivateKeepAwake('alarm-trigger');
      }
      VibrationService.stop();
      player.pause();
    };
  }, [alarmToneId, vibrationPattern, preventAutoLock, alarm, params.time, player]);

  const stopAlarm = useCallback(async () => {
    VibrationService.stop();
    player.pause();
  }, [player]);

  const handleSnooze = useCallback(async () => {
    await stopAlarm();

    if (alarm) {
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
      await AlarmScheduler.dismissAlarm(alarm);

      // Schedule wake check if protocol is enabled
      if (isWakeCheckEnabled) {
        await AlarmScheduler.scheduleWakeCheck(alarm);
      }
    }

    router.back();
  }, [alarm, stopAlarm, isWakeCheckEnabled, challengeType, attempt]);

  // Challenge callbacks
  const handleChallengeSuccess = useCallback(async () => {
    // Track challenge completed
    AnalyticsEvents.challengeCompleted(challengeType, difficulty, attempt);
    await handleDismiss();
  }, [handleDismiss, challengeType, difficulty, attempt]);

  const handleChallengeAttempt = useCallback(
    (correct: boolean) => {
      if (!correct) {
        if (attempt >= maxAttempts) {
          // Track challenge failed after max attempts
          AnalyticsEvents.challengeFailed(challengeType, difficulty);
        } else if (attempt < maxAttempts) {
          setAttempt((prev) => prev + 1);
        }
      }
    },
    [attempt, maxAttempts, challengeType, difficulty]
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
