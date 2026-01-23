import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface CircadianRhythmTrackerProps {
  avgWakeTime: string;
  alignmentScore: number;
  suggestion: string;
  optimalWakeWindow: { start: string; end: string };
  consistencyScore: number;
}

export function CircadianRhythmTracker({
  avgWakeTime,
  alignmentScore,
  suggestion,
  optimalWakeWindow,
  consistencyScore,
}: CircadianRhythmTrackerProps) {
  const { t } = useTranslation();
  const shadowStyle = useShadowStyle('sm');

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.green[500];
    if (score >= 60) return COLORS.brandPrimary;
    if (score >= 40) return COLORS.orange[500];
    return COLORS.red[500];
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('dashboard.circadian.excellent');
    if (score >= 60) return t('dashboard.circadian.good');
    if (score >= 40) return t('dashboard.circadian.fair');
    return t('dashboard.circadian.poor');
  };

  return (
    <View
      className="flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark"
      style={shadowStyle}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="routine" size={24} color={COLORS.brandPrimary} />
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            {t('dashboard.circadian.title')}
          </Text>
        </View>
        <MaterialSymbol name="wb_twilight" size={20} color={COLORS.gray[500]} />
      </View>

      {/* Average Wake Time */}
      <View className="items-center rounded-lg bg-slate-50 py-4 dark:bg-slate-900">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.circadian.avgWakeTime')}
        </Text>
        <Text className="mt-1 text-4xl font-bold tabular-nums text-slate-900 dark:text-white">
          {avgWakeTime}
        </Text>
      </View>

      {/* Scores Grid */}
      <View className="flex-row gap-4">
        {/* Alignment Score */}
        <View className="flex-1 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.circadian.alignment')}
            </Text>
            <Text className="text-xs font-semibold text-slate-900 dark:text-white">
              {alignmentScore}%
            </Text>
          </View>
          <ProgressBar progress={alignmentScore} color={getScoreColor(alignmentScore)} height={6} />
          <Text className="text-xs" style={{ color: getScoreColor(alignmentScore) }}>
            {getScoreLabel(alignmentScore)}
          </Text>
        </View>

        {/* Consistency Score */}
        <View className="flex-1 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.circadian.consistency')}
            </Text>
            <Text className="text-xs font-semibold text-slate-900 dark:text-white">
              {consistencyScore}%
            </Text>
          </View>
          <ProgressBar
            progress={consistencyScore}
            color={getScoreColor(consistencyScore)}
            height={6}
          />
          <Text className="text-xs" style={{ color: getScoreColor(consistencyScore) }}>
            {getScoreLabel(consistencyScore)}
          </Text>
        </View>
      </View>

      {/* Optimal Wake Window */}
      <View className="gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('dashboard.circadian.optimalWindow')}
          </Text>
          <View className="flex-row items-center gap-1">
            <MaterialSymbol name="schedule" size={14} color={COLORS.brandPrimary} />
            <Text className="text-sm font-bold text-brand-primary">
              {optimalWakeWindow.start} - {optimalWakeWindow.end}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
          <MaterialSymbol name="tips_and_updates" size={16} color={COLORS.brandPrimary} />
          <Text className="flex-1 text-xs text-gray-600 dark:text-gray-300">{t(suggestion)}</Text>
        </View>
      </View>

      {/* Info Footer */}
      <View className="flex-row items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <MaterialSymbol name="info" size={14} color={COLORS.gray[500]} />
        <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.circadian.basedOnCycles')}
        </Text>
      </View>
    </View>
  );
}
