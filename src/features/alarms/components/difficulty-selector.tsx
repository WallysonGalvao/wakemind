import React from 'react';

import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import { DifficultyLevel } from '@/types/alarm-enums';

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
}

export function DifficultySelector({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultySelectorProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  const difficulties: DifficultyLevel[] = [
    DifficultyLevel.EASY,
    DifficultyLevel.MEDIUM,
    DifficultyLevel.HARD,
    DifficultyLevel.ADAPTIVE,
  ];

  return (
    <View className="flex flex-col gap-2 px-4 py-3">
      <Text className="pl-1 text-sm font-medium text-slate-500 dark:text-slate-400">
        {t('newAlarm.difficulty.label')}
      </Text>

      <View className="flex h-12 w-full flex-row items-center justify-center rounded-xl bg-slate-200 p-1 dark:bg-surface-highlight">
        {difficulties.map((difficulty) => {
          const isSelected = selectedDifficulty === difficulty;
          const isAdaptive = difficulty === DifficultyLevel.ADAPTIVE;

          return (
            <Pressable
              key={difficulty}
              onPress={() => onDifficultyChange(difficulty)}
              className={`h-full flex-1 flex-row items-center justify-center gap-1 rounded-lg ${
                isSelected
                  ? 'border border-slate-100 bg-white dark:border-transparent dark:bg-brand-primary'
                  : ''
              }`}
              style={isSelected ? shadowStyle : undefined}
              accessibilityRole="button"
            >
              {isAdaptive && isSelected ? (
                <MaterialSymbol
                  name="auto_awesome"
                  size={16}
                  className="text-brand-primary dark:text-white"
                />
              ) : null}
              <Text
                className={`text-sm font-${isSelected ? 'bold' : 'medium'} ${
                  isSelected
                    ? 'text-brand-primary dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
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
