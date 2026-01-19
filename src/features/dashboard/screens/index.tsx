import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, View } from 'react-native';

import { useExecutionScore } from '../hooks/use-execution-score';
import { useWakeConsistency } from '../hooks/use-wake-consistency';

import { Header } from '@/components/header';
import { SegmentedControl } from '@/components/segmented-control';
import { DailyExecutionScore } from '@/features/dashboard/components/daily-execution-score';
import { WakeConsistency } from '@/features/dashboard/components/wake-consistency';
import type { PeriodType } from '@/features/dashboard/types';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');

  useAnalyticsScreen('Dashboard');

  // Get real execution score data from database
  const executionData = useExecutionScore(selectedPeriod);

  // Get real wake consistency data from database
  const wakeConsistencyData = useWakeConsistency(selectedPeriod);

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
          { value: 'custom', label: t('dashboard.period.custom') },
        ]}
        selectedValue={selectedPeriod}
        onValueChange={setSelectedPeriod}
      />

      {/* Content */}
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-6">
        {/* Daily Execution Score */}
        <DailyExecutionScore
          score={executionData.score}
          percentageChange={executionData.percentageChange}
          period={selectedPeriod}
          sparklineData={executionData.sparklineData}
        />

        {/* Wake Consistency */}
        <WakeConsistency
          targetTime={wakeConsistencyData.targetTime}
          averageTime={wakeConsistencyData.averageTime}
          variance={wakeConsistencyData.variance}
          period={wakeConsistencyData.period}
          chartData={wakeConsistencyData.chartData}
        />
      </ScrollView>
    </View>
  );
}
