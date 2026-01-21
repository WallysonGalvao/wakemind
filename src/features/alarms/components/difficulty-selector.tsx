import React from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import type { SegmentedControlItem } from '@/components/segmented-control';
import { SegmentedControl } from '@/components/segmented-control';
import { Text } from '@/components/ui/text';
import { useFeatureAccess } from '@/hooks/use-feature-access';
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
  const { canUseDifficulty } = useFeatureAccess();

  // Check if Hard difficulty is available
  const canUseHard = canUseDifficulty('hard');

  // Handle difficulty change with premium check
  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    // If user selects Hard and doesn't have access, show paywall
    if (difficulty === DifficultyLevel.HARD && !canUseHard) {
      router.push('/subscription/paywall');
      return;
    }
    onDifficultyChange(difficulty);
  };

  const items: SegmentedControlItem<DifficultyLevel>[] = [
    { value: DifficultyLevel.EASY, label: t('newAlarm.difficulty.easy') },
    { value: DifficultyLevel.MEDIUM, label: t('newAlarm.difficulty.medium') },
    {
      value: DifficultyLevel.HARD,
      label: t('newAlarm.difficulty.hard'),
      // Show lock icon for free users, crown for pro users
      icon: canUseHard ? undefined : 'lock',
      showIconWhenSelected: !canUseHard,
    },
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
        return canUseHard
          ? t('newAlarm.difficulty.hardDescription')
          : t('featureGate.hardDifficulty');
      // TODO: Feature futura - Difficulty Adaptive
      // case DifficultyLevel.ADAPTIVE:
      //   return t('newAlarm.difficulty.adaptiveDescription');
      default:
        return t('newAlarm.difficulty.mediumDescription');
    }
  };

  return (
    <View>
      <SegmentedControl
        title={t('newAlarm.difficulty.label')}
        description={getDescription()}
        items={items}
        selectedValue={selectedDifficulty}
        onValueChange={handleDifficultyChange}
      />

      {/* Pro Badge shown when Hard is selected but user is not Pro */}
      {selectedDifficulty === DifficultyLevel.HARD && !canUseHard ? (
        <Pressable
          onPress={() => router.push('/subscription/paywall')}
          accessibilityRole="button"
          className="mx-4 mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-primary-500/10 p-3"
        >
          <MaterialSymbol name="workspace_premium" size={20} className="text-primary-500" />
          <Text className="text-sm font-semibold text-primary-500">
            {t('settings.subscription.upgrade')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
