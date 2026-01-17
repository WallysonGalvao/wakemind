import React from 'react';

import { useTranslation } from 'react-i18next';

import type { SegmentedControlItem } from '@/components/segmented-control';
import { SegmentedControl } from '@/components/segmented-control';
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

  const items: SegmentedControlItem<DifficultyLevel>[] = [
    { value: DifficultyLevel.EASY, label: t('newAlarm.difficulty.easy') },
    { value: DifficultyLevel.MEDIUM, label: t('newAlarm.difficulty.medium') },
    { value: DifficultyLevel.HARD, label: t('newAlarm.difficulty.hard') },
    // TODO: Feature futura - Difficulty Adaptive (requer ML/histórico de performance)
    // {
    //   value: DifficultyLevel.ADAPTIVE,
    //   label: t('newAlarm.difficulty.adaptive'),
    //   icon: 'auto_awesome',
    //   showIconWhenSelected: true,
    // },
  ];

  // Get description based on selected difficulty
  const getDescription = () => {
    switch (selectedDifficulty) {
      case DifficultyLevel.EASY:
        return t('newAlarm.difficulty.easyDescription');
      case DifficultyLevel.MEDIUM:
        return t('newAlarm.difficulty.mediumDescription');
      case DifficultyLevel.HARD:
        return t('newAlarm.difficulty.hardDescription');
      // TODO: Feature futura - Difficulty Adaptive
      // case DifficultyLevel.ADAPTIVE:
      //   return t('newAlarm.difficulty.adaptiveDescription');
      default:
        return t('newAlarm.difficulty.mediumDescription');
    }
  };

  return (
    <SegmentedControl
      title={t('newAlarm.difficulty.label')}
      description={getDescription()}
      items={items}
      selectedValue={selectedDifficulty}
      onValueChange={onDifficultyChange}
    />
  );
}
