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
    {
      value: DifficultyLevel.ADAPTIVE,
      label: t('newAlarm.difficulty.adaptive'),
      icon: 'auto_awesome',
      showIconWhenSelected: true,
    },
  ];

  return (
    <SegmentedControl
      title={t('newAlarm.difficulty.label')}
      description={t('newAlarm.difficulty.adaptiveDescription')}
      items={items}
      selectedValue={selectedDifficulty}
      onValueChange={onDifficultyChange}
    />
  );
}
