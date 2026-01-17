import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Pressable, View, type ViewStyle } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { VibrationService } from '@/services/vibration-service';
import { useSettingsStore } from '@/stores/use-settings-store';
import { DifficultyLevel } from '@/types/alarm-enums';

// ============================================================================
// Types
// ============================================================================

type ChallengePhase = 'countdown' | 'showing' | 'input';

interface ColorConfig {
  name: string;
  bg: string;
  hex: string;
}

interface DifficultyConfig {
  patternLength: number;
  displayTime: number;
  colorCount: number;
}

interface MemoryChallengeComponentProps {
  difficulty: DifficultyLevel;
  onSuccess: () => void;
  onAttempt: (correct: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

const INITIAL_COUNTDOWN = 5;
const REVIEW_COUNTDOWN = 3;
const FAILURES_FOR_REVIEW = 3;
const ANIMATION_DURATION = 200;
const PHASE_TRANSITION_DELAY = 500;

const COLORS: ColorConfig[] = [
  { name: 'red', bg: 'bg-red-500', hex: '#EF4444' },
  { name: 'blue', bg: 'bg-blue-500', hex: '#3B82F6' },
  { name: 'green', bg: 'bg-green-500', hex: '#22C55E' },
  { name: 'yellow', bg: 'bg-yellow-500', hex: '#EAB308' },
  { name: 'purple', bg: 'bg-purple-500', hex: '#A855F7' },
  { name: 'orange', bg: 'bg-orange-500', hex: '#F97316' },
];

const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.EASY]: { patternLength: 3, displayTime: 1500, colorCount: 4 },
  [DifficultyLevel.MEDIUM]: { patternLength: 4, displayTime: 1200, colorCount: 4 },
  [DifficultyLevel.HARD]: { patternLength: 5, displayTime: 1000, colorCount: 6 },
  [DifficultyLevel.ADAPTIVE]: { patternLength: 4, displayTime: 1200, colorCount: 4 },
};

// ============================================================================
// Utility Functions
// ============================================================================

const getDifficultyConfig = (difficulty: DifficultyLevel): DifficultyConfig =>
  DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG[DifficultyLevel.ADAPTIVE];

const generatePattern = (config: DifficultyConfig): number[] =>
  Array.from({ length: config.patternLength }, () => Math.floor(Math.random() * config.colorCount));

const getActiveColors = (colorCount: number): ColorConfig[] => COLORS.slice(0, colorCount);

// ============================================================================
// Custom Hook: useMemoryChallenge
// ============================================================================

interface UseMemoryChallengeOptions {
  difficulty: DifficultyLevel;
  onSuccess: () => void;
  onAttempt: (correct: boolean) => void;
  vibrateOnSuccess: boolean;
}

interface UseMemoryChallengeReturn {
  // State
  pattern: number[];
  userInput: number[];
  phase: ChallengePhase;
  countdown: number;
  currentShowIndex: number;
  showError: boolean;
  canReviewPattern: boolean;
  // Derived
  config: DifficultyConfig;
  activeColors: ColorConfig[];
  progressDots: { filled: boolean; current: boolean }[];
  currentPatternColor: ColorConfig | null;
  isShowingPattern: boolean;
  // Animation
  highlightScale: SharedValue<number>;
  // Actions
  handleColorPress: (colorIndex: number) => void;
  handleReviewPattern: () => void;
}

function useMemoryChallenge({
  difficulty,
  onSuccess,
  onAttempt,
  vibrateOnSuccess,
}: UseMemoryChallengeOptions): UseMemoryChallengeReturn {
  const config = useMemo(() => getDifficultyConfig(difficulty), [difficulty]);
  const activeColors = useMemo(() => getActiveColors(config.colorCount), [config.colorCount]);

  // State
  const [pattern] = useState<number[]>(() => generatePattern(config));
  const [userInput, setUserInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<ChallengePhase>('countdown');
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [showError, setShowError] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [canReviewPattern, setCanReviewPattern] = useState(false);

  // Animation
  const highlightScale = useSharedValue(1);

  // Refs for timer management
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const patternIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startPatternSequenceRef = useRef<() => void>(() => {});

  // Derived state
  const isShowingPattern =
    phase === 'showing' && currentShowIndex > 0 && currentShowIndex <= pattern.length;
  const currentPatternColor = isShowingPattern ? activeColors[pattern[currentShowIndex - 1]] : null;

  const progressDots = useMemo(
    () =>
      pattern.map((_, index) => ({
        filled: index < userInput.length,
        current: index === userInput.length,
      })),
    [pattern, userInput.length]
  );

  // Start pattern sequence when entering showing phase
  startPatternSequenceRef.current = () => {
    if (patternIntervalRef.current) clearInterval(patternIntervalRef.current);

    setPhase('showing');
    setCurrentShowIndex(0);
    let showIndex = 0;

    patternIntervalRef.current = setInterval(() => {
      showIndex += 1;

      if (showIndex <= pattern.length) {
        highlightScale.value = withSequence(
          withTiming(1.2, { duration: ANIMATION_DURATION }),
          withTiming(1, { duration: ANIMATION_DURATION })
        );
        setCurrentShowIndex(showIndex);

        if (showIndex >= pattern.length) {
          if (patternIntervalRef.current) clearInterval(patternIntervalRef.current);
          setTimeout(() => {
            setPhase('input');
            setCurrentShowIndex(-1);
          }, PHASE_TRANSITION_DELAY);
        }
      }
    }, config.displayTime);
  };

  // Start countdown timer
  const startCountdown = useCallback((initialValue: number) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let currentCount = initialValue;
    setCountdown(currentCount);
    setPhase('countdown');

    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdown(0);
        startPatternSequenceRef.current();
      }
    }, 1000);
  }, []);

  // Initialize countdown on mount and cleanup on unmount
  useEffect(() => {
    startCountdown(INITIAL_COUNTDOWN);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (patternIntervalRef.current) clearInterval(patternIntervalRef.current);
    };
  }, [startCountdown]);

  // Actions
  const resetInputState = useCallback(() => {
    setShowError(false);
    setUserInput([]);
    setCurrentShowIndex(0);
  }, []);

  const handleColorPress = useCallback(
    (colorIndex: number) => {
      if (phase !== 'input') return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newInput = [...userInput, colorIndex];
      setUserInput(newInput);
      setShowError(false);

      const isCorrect = pattern[newInput.length - 1] === colorIndex;

      if (!isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowError(true);
        setUserInput([]);
        const newFailures = consecutiveFailures + 1;
        setConsecutiveFailures(newFailures);
        if (newFailures >= FAILURES_FOR_REVIEW) {
          setCanReviewPattern(true);
        }
        onAttempt(false);
        return;
      }

      if (newInput.length === pattern.length) {
        if (vibrateOnSuccess) {
          VibrationService.success();
        }
        onAttempt(true);
        onSuccess();
      }
    },
    [phase, userInput, pattern, onSuccess, onAttempt, consecutiveFailures, vibrateOnSuccess]
  );

  const handleReviewPattern = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCanReviewPattern(false);
    setConsecutiveFailures(0);
    resetInputState();
    startCountdown(REVIEW_COUNTDOWN);
  }, [resetInputState, startCountdown]);

  return {
    pattern,
    userInput,
    phase,
    countdown,
    currentShowIndex,
    showError,
    canReviewPattern,
    config,
    activeColors,
    progressDots,
    currentPatternColor,
    isShowingPattern,
    highlightScale,
    handleColorPress,
    handleReviewPattern,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface PatternDisplayProps {
  phase: ChallengePhase;
  countdown: number;
  isShowingPattern: boolean;
  currentPatternColor: ColorConfig | null;
  highlightScale: SharedValue<number>;
}

function PatternDisplay({
  phase,
  countdown,
  isShowingPattern,
  currentPatternColor,
  highlightScale,
}: PatternDisplayProps) {
  const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [{ scale: highlightScale.value }],
  }));

  if (phase === 'countdown') {
    return (
      <View className="mb-8 h-32 w-32 items-center justify-center rounded-3xl bg-primary-500/20">
        <Text className="text-6xl font-black text-primary-500">{countdown}</Text>
      </View>
    );
  }

  if (isShowingPattern && currentPatternColor) {
    return (
      <Animated.View
        className={`mb-8 h-32 w-32 items-center justify-center rounded-3xl ${currentPatternColor.bg}`}
        style={animatedStyle}
      >
        <MaterialSymbol name="circle" size={48} color="#fff" />
      </Animated.View>
    );
  }

  return (
    <View className="mb-8 h-32 w-32 items-center justify-center rounded-3xl bg-gray-200 dark:bg-gray-700">
      <MaterialSymbol
        name={phase === 'showing' ? 'visibility' : 'touch_app'}
        size={48}
        color="#9CA3AF"
      />
    </View>
  );
}

interface ProgressDotsProps {
  dots: { filled: boolean; current: boolean }[];
}

function ProgressDots({ dots }: ProgressDotsProps) {
  return (
    <View className="mb-6 flex-row gap-2">
      {dots.map((dot, index) => (
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
  );
}

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View className="mb-4 flex-row items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2">
      <MaterialSymbol name="warning" size={18} color="#F59E0B" />
      <Text className="text-xs font-bold uppercase tracking-wide text-amber-500">{message}</Text>
    </View>
  );
}

interface ReviewButtonProps {
  label: string;
  onPress: () => void;
}

function ReviewButton({ label, onPress }: ReviewButtonProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('alarmTrigger.accessibility.reviewPattern')}
      onPress={onPress}
      className="mb-6 h-32 w-32 items-center justify-center rounded-3xl bg-blue-500/20"
    >
      <MaterialSymbol name="replay" size={48} color="#3B82F6" />
      <Text className="mt-2 text-sm font-semibold text-blue-500">{label}</Text>
    </Pressable>
  );
}

interface ColorButtonProps {
  color: ColorConfig;
  disabled: boolean;
  onPress: () => void;
}

function ColorButton({ color, disabled, onPress }: ColorButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={color.name}
      accessibilityHint="Tap to select this color"
      disabled={disabled}
      onPress={onPress}
      className={`h-20 w-20 items-center justify-center rounded-2xl ${color.bg} ${disabled ? 'opacity-50' : ''}`}
    >
      <MaterialSymbol name="circle" size={32} color="#fff" />
    </Pressable>
  );
}

interface ColorGridProps {
  colors: ColorConfig[];
  disabled: boolean;
  onColorPress: (index: number) => void;
}

function ColorGrid({ colors, disabled, onColorPress }: ColorGridProps) {
  return (
    <View className="w-full max-w-xs gap-3 px-4">
      <View className="flex-row flex-wrap justify-center gap-3">
        {colors.map((color, index) => (
          <ColorButton
            key={color.name}
            color={color}
            disabled={disabled}
            onPress={() => onColorPress(index)}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MemoryChallengeComponent({
  difficulty,
  onSuccess,
  onAttempt,
}: MemoryChallengeComponentProps) {
  const { t } = useTranslation();
  const vibrateOnSuccess = useSettingsStore((state) => state.vibrateOnSuccess);

  const {
    phase,
    countdown,
    showError,
    canReviewPattern,
    activeColors,
    progressDots,
    currentPatternColor,
    isShowingPattern,
    highlightScale,
    handleColorPress,
    handleReviewPattern,
  } = useMemoryChallenge({ difficulty, onSuccess, onAttempt, vibrateOnSuccess });

  const phaseText = useMemo(() => {
    switch (phase) {
      case 'countdown':
        return t('alarmTrigger.getReady');
      case 'showing':
        return t('alarmTrigger.watchPattern');
      case 'input':
        return t('alarmTrigger.repeatPattern');
    }
  }, [phase, t]);

  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* Challenge Label */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        {t('alarmTrigger.memoryChallenge')}
      </Text>

      {/* Phase indicator */}
      <Text className="mb-6 text-lg font-semibold text-gray-700 dark:text-gray-300">
        {phaseText}
      </Text>

      {/* Review Pattern and Pattern Display */}
      {canReviewPattern ? (
        <ReviewButton label={t('alarmTrigger.reviewPattern')} onPress={handleReviewPattern} />
      ) : (
        <PatternDisplay
          phase={phase}
          countdown={countdown}
          isShowingPattern={isShowingPattern}
          currentPatternColor={currentPatternColor}
          highlightScale={highlightScale}
        />
      )}

      {/* Progress dots */}
      <ProgressDots dots={progressDots} />

      {/* Error Message */}
      {showError ? <ErrorMessage message={t('alarmTrigger.wrongAnswer')} /> : null}

      {/* Color buttons grid */}
      <ColorGrid
        colors={activeColors}
        disabled={phase !== 'input'}
        onColorPress={handleColorPress}
      />
    </View>
  );
}
