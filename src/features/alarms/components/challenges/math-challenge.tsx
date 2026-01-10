import { useCallback, useMemo, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { VibrationService } from '@/services/vibration-service';
import { useSettingsStore } from '@/stores/use-settings-store';
import { DifficultyLevel } from '@/types/alarm-enums';

interface MathChallenge {
  expression: string;
  answer: number;
}

// Generate a math challenge based on difficulty level
const generateMathChallenge = (
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): MathChallenge => {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return generateEasyChallenge();
    case DifficultyLevel.MEDIUM:
      return generateMediumChallenge();
    case DifficultyLevel.HARD:
      return generateHardChallenge();
    case DifficultyLevel.ADAPTIVE:
    default:
      return generateMediumChallenge();
  }
};

// Easy: Simple addition/subtraction with two small numbers
const generateEasyChallenge = (): MathChallenge => {
  const operations = ['+', '-'];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let a: number, b: number, result: number;

  if (op === '+') {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    result = a + b;
  } else {
    a = Math.floor(Math.random() * 30) + 10;
    b = Math.floor(Math.random() * a) + 1;
    result = a - b;
  }

  return { expression: `${a} ${op} ${b}`, answer: result };
};

// Medium: Two operations with moderate numbers
const generateMediumChallenge = (): MathChallenge => {
  const operations = ['+', '-'];
  const op1 = operations[Math.floor(Math.random() * operations.length)];
  const op2 = operations[Math.floor(Math.random() * operations.length)];

  const a = Math.floor(Math.random() * 30) + 10;
  const b = Math.floor(Math.random() * 20) + 5;
  const c = Math.floor(Math.random() * 15) + 1;

  let intermediate: number;
  if (op1 === '+') intermediate = a + b;
  else intermediate = a - b;

  let result: number;
  if (op2 === '+') result = intermediate + c;
  else result = intermediate - c;

  if (result < 0) return generateMediumChallenge();

  return { expression: `${a} ${op1} ${b} ${op2} ${c}`, answer: result };
};

// Hard: Multiplication with proper precedence
const generateHardChallenge = (): MathChallenge => {
  const challengeType = Math.floor(Math.random() * 3);

  switch (challengeType) {
    case 0:
      return generateMultiplyThenAdd();
    case 1:
      return generateMultiplyThenSubtract();
    case 2:
    default:
      return generateAddThenMultiply();
  }
};

const generateMultiplyThenAdd = (): MathChallenge => {
  const a = Math.floor(Math.random() * 10) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  const c = Math.floor(Math.random() * 20) + 1;
  return { expression: `${a} x ${b} + ${c}`, answer: a * b + c };
};

const generateMultiplyThenSubtract = (): MathChallenge => {
  const a = Math.floor(Math.random() * 10) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  const product = a * b;
  const c = Math.floor(Math.random() * Math.min(product - 1, 20)) + 1;
  return { expression: `${a} x ${b} - ${c}`, answer: product - c };
};

const generateAddThenMultiply = (): MathChallenge => {
  const a = Math.floor(Math.random() * 30) + 10;
  const b = Math.floor(Math.random() * 5) + 2;
  const c = Math.floor(Math.random() * 5) + 2;
  return { expression: `${a} + ${b} x ${c}`, answer: a + b * c };
};

interface MathChallengeComponentProps {
  difficulty: DifficultyLevel;
  onSuccess: () => void;
  onAttempt: (correct: boolean) => void;
}

export function MathChallengeComponent({
  difficulty,
  onSuccess,
  onAttempt,
}: MathChallengeComponentProps) {
  const { t } = useTranslation();
  const vibrateOnSuccess = useSettingsStore((state) => state.vibrateOnSuccess);
  const [mathChallenge] = useState(() => generateMathChallenge(difficulty));
  const [userInput, setUserInput] = useState('');
  const [showError, setShowError] = useState(false);

  const answerDigitCount = useMemo(
    () => mathChallenge.answer.toString().length,
    [mathChallenge.answer]
  );

  const numpadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['backspace', '0', 'check'],
  ];

  const handleNumberPress = useCallback(
    (num: string) => {
      if (userInput.length < answerDigitCount) {
        setUserInput((prev) => prev + num);
        setShowError(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [userInput.length, answerDigitCount]
  );

  const handleBackspace = useCallback(() => {
    setUserInput((prev) => prev.slice(0, -1));
    setShowError(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSubmit = useCallback(() => {
    const userAnswer = parseInt(userInput, 10);

    if (userAnswer === mathChallenge.answer) {
      if (vibrateOnSuccess) {
        VibrationService.success();
      }
      onAttempt(true);
      onSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowError(true);
      setUserInput('');
      onAttempt(false);
    }
  }, [userInput, mathChallenge.answer, onSuccess, onAttempt, vibrateOnSuccess]);

  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* Challenge Label */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        {t('alarmTrigger.cognitiveChallenge')}
      </Text>

      {/* Math Expression */}
      <Text className="mb-8 text-6xl font-black tracking-tight text-gray-900 drop-shadow-2xl dark:text-white">
        {mathChallenge.expression}
      </Text>

      {/* Answer Input Display */}
      <View className="mb-6 flex-row justify-center gap-4">
        {Array.from({ length: answerDigitCount }).map((_, index) => (
          <View
            key={index}
            className={`h-24 w-20 items-center justify-center rounded-2xl border-2 ${
              userInput[index]
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-300 bg-gray-100 dark:border-surface-highlight dark:bg-surface-dark'
            }`}
          >
            <Text
              className={`text-5xl font-black ${
                userInput[index]
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-white/30'
              }`}
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
                    className="h-16 flex-1 items-center justify-center rounded-2xl border border-transparent bg-gray-100 dark:bg-surface-dark"
                  >
                    <MaterialSymbol name="backspace" size={24} color="#6B7280" />
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
                    className="h-16 flex-1 items-center justify-center rounded-2xl border border-primary-500/50 bg-primary-500"
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
                  className="h-16 flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/5 dark:bg-surface-dark"
                >
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">{key}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
