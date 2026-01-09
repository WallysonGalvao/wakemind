import { useCallback, useEffect, useMemo, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { DifficultyLevel } from '@/types/alarm-enums';

// Pattern configuration by difficulty
const getDifficultyConfig = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return { patternLength: 3, displayTime: 1500, colors: 4 };
    case DifficultyLevel.MEDIUM:
      return { patternLength: 4, displayTime: 1200, colors: 4 };
    case DifficultyLevel.HARD:
      return { patternLength: 5, displayTime: 1000, colors: 6 };
    case DifficultyLevel.ADAPTIVE:
    default:
      return { patternLength: 4, displayTime: 1200, colors: 4 };
  }
};

const COLORS = [
  { name: 'red', bg: 'bg-red-500', text: '#EF4444' },
  { name: 'blue', bg: 'bg-blue-500', text: '#3B82F6' },
  { name: 'green', bg: 'bg-green-500', text: '#22C55E' },
  { name: 'yellow', bg: 'bg-yellow-500', text: '#EAB308' },
  { name: 'purple', bg: 'bg-purple-500', text: '#A855F7' },
  { name: 'orange', bg: 'bg-orange-500', text: '#F97316' },
];

interface MemoryChallengeComponentProps {
  difficulty: DifficultyLevel;
  onSuccess: () => void;
  onAttempt: (correct: boolean) => void;
}

export function MemoryChallengeComponent({
  difficulty,
  onSuccess,
  onAttempt,
}: MemoryChallengeComponentProps) {
  const { t } = useTranslation();
  const config = useMemo(() => getDifficultyConfig(difficulty), [difficulty]);

  // Generate pattern during initialization
  const [pattern] = useState<number[]>(() => {
    const newPattern: number[] = [];
    const cfg = getDifficultyConfig(difficulty);
    for (let i = 0; i < cfg.patternLength; i++) {
      newPattern.push(Math.floor(Math.random() * cfg.colors));
    }
    return newPattern;
  });
  const [userInput, setUserInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'showing' | 'input'>('showing');
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [showError, setShowError] = useState(false);

  const activeColors = useMemo(() => COLORS.slice(0, config.colors), [config.colors]);

  // Animation for highlighting
  const highlightScale = useSharedValue(1);

  const highlightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: highlightScale.value }],
  }));

  // Show pattern sequence using interval
  useEffect(() => {
    if (phase !== 'showing' || pattern.length === 0) return;

    const timer = setInterval(() => {
      setCurrentShowIndex((prev) => {
        if (prev < pattern.length) {
          highlightScale.value = withSequence(
            withTiming(1.2, { duration: 200 }),
            withTiming(1, { duration: 200 })
          );
          const nextIndex = prev + 1;
          // Switch to input phase when pattern is complete
          if (nextIndex >= pattern.length) {
            setTimeout(() => {
              setPhase('input');
              setCurrentShowIndex(-1);
            }, 500);
          }
          return nextIndex;
        }
        return prev;
      });
    }, config.displayTime);

    return () => clearInterval(timer);
  }, [phase, pattern.length, config.displayTime, highlightScale]);

  const handleColorPress = useCallback(
    (colorIndex: number) => {
      if (phase !== 'input') return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newInput = [...userInput, colorIndex];
      setUserInput(newInput);
      setShowError(false);

      // Check if this input is correct
      if (pattern[newInput.length - 1] !== colorIndex) {
        // Wrong input
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowError(true);
        setUserInput([]);
        onAttempt(false);
        return;
      }

      // Check if pattern is complete
      if (newInput.length === pattern.length) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onAttempt(true);
        onSuccess();
      }
    },
    [phase, userInput, pattern, onSuccess, onAttempt]
  );

  const progressDots = useMemo(() => {
    return pattern.map((_, index) => ({
      filled: index < userInput.length,
      current: index === userInput.length,
    }));
  }, [pattern, userInput.length]);

  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* Challenge Label */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        {t('alarmTrigger.memoryChallenge')}
      </Text>

      {/* Phase indicator */}
      <Text className="mb-6 text-lg font-semibold text-gray-700 dark:text-gray-300">
        {phase === 'showing' ? t('alarmTrigger.watchPattern') : t('alarmTrigger.repeatPattern')}
      </Text>

      {/* Pattern display during showing phase */}
      {phase === 'showing' && currentShowIndex > 0 && currentShowIndex <= pattern.length ? (
        <Animated.View
          className={`mb-8 h-32 w-32 items-center justify-center rounded-3xl ${activeColors[pattern[currentShowIndex - 1]].bg}`}
          style={highlightAnimatedStyle}
        >
          <MaterialSymbol name="circle" size={48} color="#fff" />
        </Animated.View>
      ) : (
        <View className="mb-8 h-32 w-32 items-center justify-center rounded-3xl bg-gray-200 dark:bg-gray-700">
          {phase === 'showing' ? (
            <MaterialSymbol name="visibility" size={48} color="#9CA3AF" />
          ) : (
            <MaterialSymbol name="touch_app" size={48} color="#9CA3AF" />
          )}
        </View>
      )}

      {/* Progress dots */}
      <View className="mb-6 flex-row gap-2">
        {progressDots.map((dot, index) => (
          <View
            key={index}
            className={`h-3 w-3 rounded-full ${
              dot.filled
                ? 'bg-primary-500'
                : dot.current
                  ? 'border-2 border-primary-500 bg-transparent'
                  : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
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

      {/* Color buttons grid */}
      <View className="w-full max-w-xs gap-3 px-4">
        <View className="flex-row flex-wrap justify-center gap-3">
          {activeColors.map((color, index) => (
            <Pressable
              key={color.name}
              accessibilityRole="button"
              accessibilityLabel={color.name}
              accessibilityHint="Tap to select this color"
              disabled={phase !== 'input'}
              onPress={() => handleColorPress(index)}
              className={`h-20 w-20 items-center justify-center rounded-2xl ${color.bg} ${
                phase !== 'input' ? 'opacity-50' : 'active:scale-95'
              }`}
            >
              <MaterialSymbol name="circle" size={32} color="#fff" />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
