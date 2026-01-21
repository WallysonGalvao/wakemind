import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, View } from 'react-native';

import { AddWidget } from '../components/add-widget';
import { useAvgLatency } from '../hooks/use-avg-latency';
import { useCognitiveActivation } from '../hooks/use-cognitive-activation';
import { useCurrentStreak } from '../hooks/use-current-streak';
import { useDailyInsight } from '../hooks/use-daily-insight';
import { useExecutionScore } from '../hooks/use-execution-score';
import { useWakeConsistency } from '../hooks/use-wake-consistency';

import { Header } from '@/components/header';
import { SegmentedControl } from '@/components/segmented-control';
import { AvgLatency } from '@/features/dashboard/components/widgets/avg-latency';
import { CognitiveActivation } from '@/features/dashboard/components/widgets/cognitive-activation';
import { CurrentStreak } from '@/features/dashboard/components/widgets/current-streak';
import { DailyExecutionScore } from '@/features/dashboard/components/widgets/daily-execution-score';
import { DailyInsight } from '@/features/dashboard/components/widgets/daily-insight';
import { WakeConsistency } from '@/features/dashboard/components/widgets/wake-consistency';
import type { PeriodType } from '@/features/dashboard/types';
import { FeatureGate } from '@/features/subscription/components/feature-gate';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useWidgetStore } from '@/stores/use-widget-store';
import { WidgetType } from '@/types/widgets';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const enabledWidgets = useWidgetStore((state) => state.enabledWidgets);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');

  useAnalyticsScreen('Dashboard');

  // Get real execution score data from database
  const executionData = useExecutionScore(selectedPeriod);

  // Get real wake consistency data from database
  const wakeConsistencyData = useWakeConsistency(selectedPeriod);

  // Get cognitive activation data for current month
  const cognitiveActivationData = useCognitiveActivation();

  // Get current streak and latency data
  const currentStreak = useCurrentStreak();
  const avgLatency = useAvgLatency(selectedPeriod);

  // Get daily insight based on metrics
  const dailyInsight = useDailyInsight({
    variance: wakeConsistencyData.variance,
    executionScore: executionData.score,
    streak: currentStreak,
  });

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header title={t('tabs.dashboard')} />
      </View>

      {/* Period Selector */}
      <SegmentedControl
        items={[
          { value: 'day', label: t('dashboard.period.day') },
          { value: 'week', label: t('dashboard.period.week') },
          { value: 'month', label: t('dashboard.period.month') },
          // { value: 'custom', label: t('dashboard.period.custom') },
        ]}
        selectedValue={selectedPeriod}
        onValueChange={setSelectedPeriod}
      />

      {/* Content */}
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-6">
        {/* Daily Execution Score */}
        {enabledWidgets.has(WidgetType.EXECUTION_SCORE) && (
          <DailyExecutionScore
            score={executionData.score}
            percentageChange={executionData.percentageChange}
            period={selectedPeriod}
            sparklineData={executionData.sparklineData}
          />
        )}

        {/* Daily Insight */}
        {enabledWidgets.has(WidgetType.DAILY_INSIGHT) && <DailyInsight insight={dailyInsight} />}

        {/* Wake Consistency */}
        {enabledWidgets.has(WidgetType.WAKE_CONSISTENCY) && (
          <WakeConsistency
            targetTime={wakeConsistencyData.targetTime}
            averageTime={wakeConsistencyData.averageTime}
            variance={wakeConsistencyData.variance}
            period={wakeConsistencyData.period}
            chartData={wakeConsistencyData.chartData}
          />
        )}

        {/* Current Streak and Avg Latency Grid */}
        {(enabledWidgets.has(WidgetType.CURRENT_STREAK) ||
          enabledWidgets.has(WidgetType.AVG_LATENCY)) && (
          <View className="flex-row gap-4">
            {enabledWidgets.has(WidgetType.CURRENT_STREAK) && (
              <CurrentStreak streak={currentStreak} />
            )}
            {enabledWidgets.has(WidgetType.AVG_LATENCY) && (
              <AvgLatency latencyMinutes={avgLatency} />
            )}
          </View>
        )}

        {/* Cognitive Activation - Premium Feature */}
        {enabledWidgets.has(WidgetType.COGNITIVE_MAP) && (
          <FeatureGate featureName="advanced_stats" upgradeMessage={t('featureGate.advancedStats')}>
            <CognitiveActivation data={cognitiveActivationData} />
          </FeatureGate>
        )}

        <AddWidget />
      </ScrollView>
    </View>
  );
}
