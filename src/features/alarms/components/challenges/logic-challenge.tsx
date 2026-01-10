import { useCallback, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { VibrationService } from '@/services/vibration-service';
import { useSettingsStore } from '@/stores/use-settings-store';
import { DifficultyLevel } from '@/types/alarm-enums';

// Logic puzzle types
type LogicPuzzle = {
  type: 'sequence' | 'oddOneOut' | 'pattern';
  question: string;
  options: string[];
  correctIndex: number;
  hint?: string;
};

// Generate puzzles by difficulty
const generateSequencePuzzle = (difficulty: DifficultyLevel): LogicPuzzle => {
  const sequences = {
    [DifficultyLevel.EASY]: [
      { seq: [2, 4, 6, 8], answer: 10, display: '2, 4, 6, 8, ?' },
      { seq: [5, 10, 15, 20], answer: 25, display: '5, 10, 15, 20, ?' },
      { seq: [1, 3, 5, 7], answer: 9, display: '1, 3, 5, 7, ?' },
      { seq: [3, 6, 9, 12], answer: 15, display: '3, 6, 9, 12, ?' },
    ],
    [DifficultyLevel.MEDIUM]: [
      { seq: [1, 2, 4, 8], answer: 16, display: '1, 2, 4, 8, ?' },
      { seq: [1, 1, 2, 3, 5], answer: 8, display: '1, 1, 2, 3, 5, ?' },
      { seq: [2, 6, 12, 20], answer: 30, display: '2, 6, 12, 20, ?' },
      { seq: [1, 4, 9, 16], answer: 25, display: '1, 4, 9, 16, ?' },
    ],
    [DifficultyLevel.HARD]: [
      { seq: [1, 3, 7, 15], answer: 31, display: '1, 3, 7, 15, ?' },
      { seq: [2, 3, 5, 7, 11], answer: 13, display: '2, 3, 5, 7, 11, ?' },
      { seq: [1, 2, 6, 24], answer: 120, display: '1, 2, 6, 24, ?' },
      { seq: [3, 4, 7, 11, 18], answer: 29, display: '3, 4, 7, 11, 18, ?' },
    ],
    [DifficultyLevel.ADAPTIVE]: [
      { seq: [1, 2, 4, 8], answer: 16, display: '1, 2, 4, 8, ?' },
      { seq: [1, 1, 2, 3, 5], answer: 8, display: '1, 1, 2, 3, 5, ?' },
    ],
  };

  const puzzleSet = sequences[difficulty] || sequences[DifficultyLevel.MEDIUM];
  const selected = puzzleSet[Math.floor(Math.random() * puzzleSet.length)];

  // Generate wrong options
  const wrongOptions = [selected.answer + 1, selected.answer - 1, selected.answer + 2].filter(
    (n) => n !== selected.answer && n > 0
  );

  const options = [selected.answer.toString(), ...wrongOptions.slice(0, 3).map(String)];
  const shuffled = options.sort(() => Math.random() - 0.5);

  return {
    type: 'sequence',
    question: selected.display,
    options: shuffled,
    correctIndex: shuffled.indexOf(selected.answer.toString()),
    hint: 'Find the pattern',
  };
};

const generateOddOneOutPuzzle = (difficulty: DifficultyLevel): LogicPuzzle => {
  const puzzles = {
    [DifficultyLevel.EASY]: [
      { items: ['🍎', '🍊', '🍋', '🐕'], oddIndex: 3, hint: 'Fruits vs Animal' },
      { items: ['🚗', '🚌', '🚂', '🌲'], oddIndex: 3, hint: 'Vehicles vs Nature' },
      { items: ['⭐', '🌙', '☀️', '🎈'], oddIndex: 3, hint: 'Sky objects' },
    ],
    [DifficultyLevel.MEDIUM]: [
      { items: ['2', '4', '6', '9'], oddIndex: 3, hint: 'Even numbers' },
      { items: ['A', 'E', 'I', 'B'], oddIndex: 3, hint: 'Vowels' },
      { items: ['🔵', '🔴', '🟢', '⬛'], oddIndex: 3, hint: 'Colors vs Shape' },
    ],
    [DifficultyLevel.HARD]: [
      { items: ['2', '3', '5', '9'], oddIndex: 3, hint: 'Prime numbers' },
      { items: ['1', '4', '9', '15'], oddIndex: 3, hint: 'Perfect squares' },
      { items: ['8', '27', '64', '100'], oddIndex: 3, hint: 'Perfect cubes' },
    ],
    [DifficultyLevel.ADAPTIVE]: [
      { items: ['2', '4', '6', '9'], oddIndex: 3, hint: 'Even numbers' },
    ],
  };

  const puzzleSet = puzzles[difficulty] || puzzles[DifficultyLevel.MEDIUM];
  const selected = puzzleSet[Math.floor(Math.random() * puzzleSet.length)];

  return {
    type: 'oddOneOut',
    question: "Which one doesn't belong?",
    options: selected.items,
    correctIndex: selected.oddIndex,
    hint: selected.hint,
  };
};

const generatePuzzle = (difficulty: DifficultyLevel): LogicPuzzle => {
  const puzzleTypes = ['sequence', 'oddOneOut'] as const;
  const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];

  switch (type) {
    case 'sequence':
      return generateSequencePuzzle(difficulty);
    case 'oddOneOut':
      return generateOddOneOutPuzzle(difficulty);
    default:
      return generateSequencePuzzle(difficulty);
  }
};

interface LogicChallengeComponentProps {
  difficulty: DifficultyLevel;
  onSuccess: () => void;
  onAttempt: (correct: boolean) => void;
}

export function LogicChallengeComponent({
  difficulty,
  onSuccess,
  onAttempt,
}: LogicChallengeComponentProps) {
  const { t } = useTranslation();
  const vibrateOnSuccess = useSettingsStore((state) => state.vibrateOnSuccess);

  const [puzzle, setPuzzle] = useState<LogicPuzzle>(() => generatePuzzle(difficulty));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Animation values
  const shakeX = useSharedValue(0);
  const successScale = useSharedValue(1);

  const shakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const handleOptionPress = useCallback(
    (index: number) => {
      if (selectedIndex !== null) return; // Already selected

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedIndex(index);
      setShowError(false);

      if (index === puzzle.correctIndex) {
        // Correct!
        successScale.value = withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 12 })
        );
        if (vibrateOnSuccess) {
          VibrationService.success();
        }
        onAttempt(true);
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        // Wrong
        shakeX.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowError(true);
        onAttempt(false);

        // Reset for next attempt
        setTimeout(() => {
          setSelectedIndex(null);
          setPuzzle(generatePuzzle(difficulty));
        }, 1500);
      }
    },
    [selectedIndex, puzzle.correctIndex, onSuccess, onAttempt, shakeX, successScale, difficulty, vibrateOnSuccess]
  );

  const toggleHint = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHint((prev) => !prev);
  }, []);

  const getOptionStyle = useCallback(
    (index: number) => {
      if (selectedIndex === null) {
        return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
      }
      if (index === puzzle.correctIndex) {
        return 'border-green-500 bg-green-500/20';
      }
      if (index === selectedIndex && index !== puzzle.correctIndex) {
        return 'border-red-500 bg-red-500/20';
      }
      return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 opacity-50';
    },
    [selectedIndex, puzzle.correctIndex]
  );

  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* Challenge Label */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        {t('alarmTrigger.logicChallenge')}
      </Text>

      {/* Question */}
      <Animated.View style={[shakeAnimatedStyle]} className="mb-6 items-center">
        <Text className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
          {puzzle.type === 'sequence' ? puzzle.question : t('alarmTrigger.whichDoesntBelong')}
        </Text>
      </Animated.View>

      {/* Hint Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show hint"
        accessibilityHint="Tap to reveal a hint for the puzzle"
        onPress={toggleHint}
        className="mb-4 flex-row items-center gap-1 rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-700"
      >
        <MaterialSymbol name="lightbulb" size={16} color="#F59E0B" />
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {showHint ? puzzle.hint : t('alarmTrigger.showHint')}
        </Text>
      </Pressable>

      {/* Error Message */}
      {showError ? (
        <View className="mb-4 flex-row items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2">
          <MaterialSymbol name="warning" size={18} color="#F59E0B" />
          <Text className="text-xs font-bold uppercase tracking-wide text-amber-500">
            {t('alarmTrigger.wrongAnswer')}
          </Text>
        </View>
      ) : null}

      {/* Options Grid */}
      <Animated.View style={[successAnimatedStyle]} className="w-full max-w-sm gap-3">
        <View className="flex-row flex-wrap justify-center gap-3">
          {puzzle.options.map((option, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Option ${option}`}
              accessibilityHint="Select this option as your answer"
              disabled={selectedIndex !== null}
              onPress={() => handleOptionPress(index)}
              className={`min-h-[70px] min-w-[70px] items-center justify-center rounded-2xl border-2 px-4 py-3 ${getOptionStyle(index)}`}
            >
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">{option}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Puzzle Type Indicator */}
      <View className="mt-6 flex-row items-center gap-2">
        <MaterialSymbol
          name={puzzle.type === 'sequence' ? 'functions' : 'category'}
          size={16}
          color="#9CA3AF"
        />
        <Text className="text-xs text-gray-500">
          {puzzle.type === 'sequence'
            ? t('alarmTrigger.sequencePuzzle')
            : t('alarmTrigger.oddOneOut')}
        </Text>
      </View>
    </View>
  );
}
