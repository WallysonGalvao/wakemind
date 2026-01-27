import React, { useMemo, useState } from 'react';

import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, View } from 'react-native';

import { AddWidget } from '../components/add-widget';
import { useAvgLatency } from '../hooks/use-avg-latency';
import { useCircadianRhythm } from '../hooks/use-circadian-rhythm';
// import { useCognitiveActivation } from '../hooks/use-cognitive-activation';
import { useCurrentStreak } from '../hooks/use-current-streak';
import { useDailyInsight } from '../hooks/use-daily-insight';
import { useExecutionScore } from '../hooks/use-execution-score';
import { useMorningRoutine } from '../hooks/use-morning-routine';
import { useSleepQuality } from '../hooks/use-sleep-quality';
import { useSnoozeAnalytics } from '../hooks/use-snooze-analytics';
import { useWakeConsistency } from '../hooks/use-wake-consistency';
import { useWeeklyHeatmap } from '../hooks/use-weekly-heatmap';

import type { IconButton } from '@/components/header';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { SegmentedControl } from '@/components/segmented-control';
import { Achievements } from '@/features/dashboard/components/widgets/achievements';
import { AvgLatency } from '@/features/dashboard/components/widgets/avg-latency';
import { CircadianRhythmTracker } from '@/features/dashboard/components/widgets/circadian-rhythm-tracker';
// import { CognitiveActivation } from '@/features/dashboard/components/widgets/cognitive-activation';
import { CurrentStreak } from '@/features/dashboard/components/widgets/current-streak';
import { DailyExecutionScore } from '@/features/dashboard/components/widgets/daily-execution-score';
import { DailyInsight } from '@/features/dashboard/components/widgets/daily-insight';
import { MorningRoutineChecklist } from '@/features/dashboard/components/widgets/morning-routine-checklist';
import { SleepQualityScore } from '@/features/dashboard/components/widgets/sleep-quality-score';
import { SnoozeAnalytics } from '@/features/dashboard/components/widgets/snooze-analytics';
import { StreakFreezeWidget } from '@/features/dashboard/components/widgets/streak-freeze';
import { WakeConsistency } from '@/features/dashboard/components/widgets/wake-consistency';
import { WeeklyHeatmap } from '@/features/dashboard/components/widgets/weekly-heatmap';
import type { PeriodType } from '@/features/dashboard/types';
import { FeatureGate } from '@/features/subscription/components/feature-gate';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useStreakFreeze } from '@/hooks/use-streak-freeze';
import { useWidgetStore } from '@/stores/use-widget-store';
import { WidgetType } from '@/types/widgets';

export default function DashboardScreen() {
  const router = useRouter();

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const enabledWidgets = useWidgetStore((state) => state.enabledWidgets);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');
  const [refreshKey, setRefreshKey] = useState(0);

  useAnalyticsScreen('Dashboard');

  // Refresh data when screen comes into focus (e.g., after completing an alarm)
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  // Get real execution score data from database
  const executionData = useExecutionScore(selectedPeriod, refreshKey);

  // Get real wake consistency data from database
  const wakeConsistencyData = useWakeConsistency(selectedPeriod, refreshKey);

  // Get cognitive activation data for current month
  // const cognitiveActivationData = useCognitiveActivation(refreshKey);

  // Get current streak and latency data
  const currentStreak = useCurrentStreak(refreshKey);
  const avgLatency = useAvgLatency(selectedPeriod, refreshKey);

  // Get streak freeze data
  const { availableTokens, useFreezeToken } = useStreakFreeze();

  // Get daily insight based on metrics
  const dailyInsight = useDailyInsight({
    variance: wakeConsistencyData.variance,
    executionScore: executionData.score,
    streak: currentStreak,
  });

  // Get new widgets data
  const snoozeAnalytics = useSnoozeAnalytics(selectedPeriod, refreshKey);
  // const goalProgress = useGoalProgress(refreshKey);
  const weeklyHeatmap = useWeeklyHeatmap(refreshKey);
  const sleepQuality = useSleepQuality(selectedPeriod, refreshKey);
  const circadianRhythm = useCircadianRhythm(refreshKey);
  const morningRoutine = useMorningRoutine(refreshKey);

  const rightIcons = useMemo(() => {
    return [
      {
        icon: <MaterialSymbol name="bolt" size={24} className="text-brand-primary" />,
        onPress: () => router.push('/achievements'),
      } as IconButton,
    ];
  }, [router]);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header title={t('tabs.dashboard')} rightIcons={rightIcons} />
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

        {/* Streak Freeze */}
        {enabledWidgets.has(WidgetType.STREAK_FREEZE) && (
          <StreakFreezeWidget availableTokens={availableTokens} onUseToken={useFreezeToken} />
        )}

        {/* Cognitive Activation - Premium Feature */}
        {/* TODO: Re-implement with unique features:
            - Performance by challenge type (Math vs Memory vs Logic)
            - Peak performance hours analysis
            - Weekly pattern insights (e.g., "You perform better on Mondays")
            - Streak analysis and predictions
        */}
        {/* {enabledWidgets.has(WidgetType.COGNITIVE_MAP) && (
          <FeatureGate featureName="advanced_stats" upgradeMessage={t('featureGate.advancedStats')}>
            <CognitiveActivation data={cognitiveActivationData} />
          </FeatureGate>
        )} */}

        {/* Achievements */}
        {enabledWidgets.has(WidgetType.ACHIEVEMENTS) && <Achievements />}

        {/* Snooze Analytics - High Priority */}
        {enabledWidgets.has(WidgetType.SNOOZE_ANALYTICS) && (
          <SnoozeAnalytics
            avgSnoozeCount={snoozeAnalytics.avgSnoozeCount}
            totalSnoozes={snoozeAnalytics.totalSnoozes}
            totalTimeLostMinutes={snoozeAnalytics.totalTimeLostMinutes}
            firstTouchRate={snoozeAnalytics.firstTouchRate}
            trendDirection={snoozeAnalytics.trendDirection}
            period={selectedPeriod}
          />
        )}

        {/* Goal Progress Tracker - High Priority */}
        {/* TODO: Implement goal creation and management UI
        {enabledWidgets.has(WidgetType.GOAL_PROGRESS) && (
          <GoalProgressTracker goals={goalProgress} />
        )} */}

        {/* Weekly Heatmap - High Priority */}
        {enabledWidgets.has(WidgetType.WEEKLY_HEATMAP) && <WeeklyHeatmap data={weeklyHeatmap} />}

        {/* Sleep Quality Score - Premium */}
        {enabledWidgets.has(WidgetType.SLEEP_QUALITY) && (
          <FeatureGate featureName="advanced_stats" upgradeMessage={t('featureGate.sleepQuality')}>
            <SleepQualityScore
              avgSleepHours={sleepQuality.avgSleepHours}
              qualityScore={sleepQuality.qualityScore}
              correlation={sleepQuality.correlation}
              recommendation={sleepQuality.recommendation}
              trendDirection={sleepQuality.trendDirection}
              period={selectedPeriod}
            />
          </FeatureGate>
        )}

        {/* Circadian Rhythm Tracker - Premium */}
        {enabledWidgets.has(WidgetType.CIRCADIAN_RHYTHM) && (
          <FeatureGate
            featureName="advanced_stats"
            upgradeMessage={t('featureGate.circadianRhythm')}
          >
            <CircadianRhythmTracker
              avgWakeTime={circadianRhythm.avgWakeTime}
              alignmentScore={circadianRhythm.alignmentScore}
              suggestion={circadianRhythm.suggestion}
              optimalWakeWindow={circadianRhythm.optimalWakeWindow}
              consistencyScore={circadianRhythm.consistencyScore}
            />
          </FeatureGate>
        )}

        {/* Morning Routine Checklist - Medium Priority */}
        {enabledWidgets.has(WidgetType.MORNING_ROUTINE) && (
          <MorningRoutineChecklist
            items={morningRoutine.items}
            stats={morningRoutine.stats}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />
        )}

        <AddWidget />
      </ScrollView>
    </View>
  );
}
