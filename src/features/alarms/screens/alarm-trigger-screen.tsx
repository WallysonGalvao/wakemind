import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

// Generate a simple math challenge
const generateMathChallenge = () => {
  const operations = ['+', '-', 'x'];
  const op1 = operations[Math.floor(Math.random() * operations.length)];
  const op2 = operations[Math.floor(Math.random() * operations.length)];

  let a: number, b: number, c: number;

  // Generate numbers based on operations to keep results positive and reasonable
  if (op1 === 'x') {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 9) + 2;
  } else {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * 30) + 5;
  }

  if (op2 === 'x') {
    c = Math.floor(Math.random() * 5) + 2;
  } else {
    c = Math.floor(Math.random() * 20) + 1;
  }

  // Calculate intermediate result
  let intermediate: number;
  if (op1 === '+') intermediate = a + b;
  else if (op1 === '-') intermediate = a - b;
  else intermediate = a * b;

  // Calculate final result
  let result: number;
  if (op2 === '+') result = intermediate + c;
  else if (op2 === '-') result = intermediate - c;
  else result = intermediate * c;

  // Ensure positive result
  if (result < 0) {
    return generateMathChallenge();
  }

  return {
    expression: `${a} ${op1} ${b} ${op2} ${c}`,
    answer: result,
  };
};

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

  // Challenge state
  const [mathChallenge] = useState(() => generateMathChallenge());
  const [userInput, setUserInput] = useState('');
  const [attempt, setAttempt] = useState(1);
  const [showError, setShowError] = useState(false);
  const maxAttempts = 3;

  const alarm = useMemo(() => {
    if (params.alarmId) {
      return getAlarmById(params.alarmId);
    }
    return undefined;
  }, [params.alarmId, getAlarmById]);

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

    router.back();
  }, [alarm, stopAlarm]);

  // Numpad handlers
  const handleNumberPress = useCallback(
    (num: string) => {
      if (userInput.length < 4) {
        setUserInput((prev) => prev + num);
        setShowError(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [userInput.length]
  );

  const handleBackspace = useCallback(() => {
    setUserInput((prev) => prev.slice(0, -1));
    setShowError(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSubmit = useCallback(async () => {
    const userAnswer = parseInt(userInput, 10);

    if (userAnswer === mathChallenge.answer) {
      // Correct answer - dismiss alarm
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await handleDismiss();
    } else {
      // Wrong answer
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowError(true);
      setUserInput('');

      if (attempt < maxAttempts) {
        setAttempt((prev) => prev + 1);
      }
    }
  }, [userInput, mathChallenge.answer, attempt, handleDismiss]);

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

  // Number pad layout
  const numpadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['backspace', '0', 'check'],
  ];

  return (
    <View className="flex-1 bg-background-dark" style={containerStyle}>
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
          <Text className="text-7xl font-bold tabular-nums tracking-tight text-white">
            {displayTime}
          </Text>
          <Text className="ml-2 text-xl font-medium text-gray-500">{displayPeriod}</Text>
        </View>

        {/* Efficiency Timer */}
        <View className="mt-4 w-44 items-center gap-1">
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
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
      <View className="flex-1 items-center justify-center px-4">
        {/* Challenge Label */}
        <Text className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          {t('alarmTrigger.cognitiveChallenge')}
        </Text>

        {/* Math Expression */}
        <Text className="mb-8 text-6xl font-black tracking-tight text-white drop-shadow-2xl">
          {mathChallenge.expression}
        </Text>

        {/* Answer Input Display */}
        <View className="mb-6 flex-row justify-center gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              className={`h-24 w-20 items-center justify-center rounded-2xl border-2 ${
                userInput[index]
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-surface-highlight bg-surface-dark'
              }`}
            >
              <Text
                className={`text-5xl font-black ${userInput[index] ? 'text-white' : 'text-white/30'}`}
              >
                {userInput[index] || ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Error Message */}
        {showError ? (
          <View className="mb-4 flex-row items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <MaterialSymbol name="warning" size={18} color="#F59E0B" />
            <Text className="text-xs font-bold uppercase tracking-wide text-amber-500">
              {t('alarmTrigger.wrongAnswer')}
            </Text>
          </View>
        ) : null}

        {/* Numpad */}
        <View className="w-full max-w-sm gap-3 px-4">
          {numpadRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-3">
              {row.map((key) => {
                if (key === 'backspace') {
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityLabel="Backspace"
                      accessibilityHint="Delete the last digit"
                      onPress={handleBackspace}
                      className="h-16 flex-1 items-center justify-center rounded-2xl border border-transparent bg-surface-dark active:scale-95"
                    >
                      <MaterialSymbol name="backspace" size={24} color="#9CA3AF" />
                    </Pressable>
                  );
                }
                if (key === 'check') {
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityLabel="Submit"
                      accessibilityHint="Submit your answer"
                      onPress={handleSubmit}
                      disabled={userInput.length === 0}
                      className="h-16 flex-1 items-center justify-center rounded-2xl border border-primary-500/50 bg-primary-500 active:scale-95"
                    >
                      <MaterialSymbol name="check" size={28} color="#fff" />
                    </Pressable>
                  );
                }
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    onPress={() => handleNumberPress(key)}
                    className="h-16 flex-1 items-center justify-center rounded-2xl border border-white/5 bg-surface-dark active:scale-95 active:bg-primary-500"
                  >
                    <Text className="text-2xl font-bold text-white">{key}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Attempts indicator */}
        <Text className="mt-6 text-[10px] uppercase tracking-widest text-gray-600">
          {t('alarmTrigger.attempt', { current: attempt, max: maxAttempts })}
        </Text>
      </View>

      {/* Snooze Button */}
      <View className="px-6 pb-6">
        <Pressable
          accessibilityRole="button"
          onPress={handleSnooze}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-surface-dark py-4"
        >
          <MaterialSymbol name="snooze" size={20} color="#9CA3AF" />
          <Text className="text-base font-medium text-gray-400">{t('alarmTrigger.snooze')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
