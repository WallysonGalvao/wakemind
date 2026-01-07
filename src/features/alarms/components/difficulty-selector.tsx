import React from 'react';

import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'adaptive';

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
}

export function DifficultySelector({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultySelectorProps) {
  const { t } = useTranslation();

  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'adaptive'];

  return (
    <View className="flex flex-col gap-2 px-4 py-3">
      <Text className="pl-1 text-sm font-medium text-slate-500 dark:text-slate-400">
        {t('newAlarm.difficulty.label')}
      </Text>

      <View className="bg-surface-highlight flex h-12 w-full flex-row items-center justify-center rounded-xl p-1">
        {difficulties.map((difficulty) => {
          const isSelected = selectedDifficulty === difficulty;
          const isAdaptive = difficulty === 'adaptive';

          return (
            <Pressable
              key={difficulty}
              onPress={() => onDifficultyChange(difficulty)}
              className={`h-full flex-1 flex-row items-center justify-center gap-1 rounded-lg ${
                isSelected ? 'bg-brand-primary' : ''
              }`}
              accessibilityRole="button"
            >
              {isAdaptive && isSelected ? (
                <MaterialSymbol name="auto_awesome" size={16} className="text-white" />
              ) : null}
              <Text
                className={`text-sm font-${isSelected ? 'bold' : 'medium'} ${
                  isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {t(`newAlarm.difficulty.${difficulty}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="pl-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
        {t('newAlarm.difficulty.adaptiveDescription')}
      </Text>
    </View>
  );
}
