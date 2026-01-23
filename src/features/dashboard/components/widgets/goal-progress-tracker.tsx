import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { GoalProgress } from '@/features/dashboard/hooks/use-goal-progress';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface GoalProgressTrackerProps {
  goals: GoalProgress[];
}

export function GoalProgressTracker({ goals }: GoalProgressTrackerProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  // Show only active (non-completed) goals, max 3
  const activeGoals = goals.filter((goal) => !goal.isCompleted).slice(0, 3);

  if (activeGoals.length === 0) {
    return (
      <View
        className="flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-surface-dark"
        style={shadowStyle}
      >
        <MaterialSymbol name="flag" size={48} color={COLORS.textSecondary} />
        <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('dashboard.goals.noActiveGoals')}
        </Text>
        <Text className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">
          {t('dashboard.goals.setGoalHint')}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark"
      style={shadowStyle}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="flag" size={24} color={COLORS.brandPrimary} />
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            {t('dashboard.goals.title')}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {activeGoals.length} {t('dashboard.goals.active')}
        </Text>
      </View>

      {/* Goals List */}
      <View className="gap-3">
        {activeGoals.map((goal) => (
          <GoalItem key={goal.id} goal={goal} />
        ))}
      </View>
    </View>
  );
}

interface GoalItemProps {
  goal: GoalProgress;
}

function GoalItem({ goal }: GoalItemProps) {
  const { t } = useTranslation();

  const getProgressColor = () => {
    if (goal.progress >= 75) return COLORS.success;
    if (goal.progress >= 50) return COLORS.brandPrimary;
    if (goal.progress >= 25) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View className="flex-col gap-2">
      {/* Goal Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name={goal.icon} size={18} color={getProgressColor()} />
          <Text className="text-sm font-medium text-slate-900 dark:text-white">
            {t(goal.title)}
          </Text>
        </View>
        <Text className="text-xs font-semibold text-slate-900 dark:text-white">
          {goal.currentValue}/{goal.target}
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar progress={goal.progress} color={getProgressColor()} height={8} />

      {/* Footer Info */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {goal.progress}% {t('dashboard.goals.complete')}
        </Text>
        {goal.daysRemaining !== null && (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {goal.daysRemaining > 0
              ? `${goal.daysRemaining} ${t('dashboard.goals.daysLeft')}`
              : t('dashboard.goals.overdue')}
          </Text>
        )}
      </View>
    </View>
  );
}
