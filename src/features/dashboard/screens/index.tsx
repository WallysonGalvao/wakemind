import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, View } from 'react-native';

import { Header } from '@/components/header';
import { SegmentedControl } from '@/components/segmented-control';
import { DailyExecutionScore } from '@/features/dashboard/components/daily-execution-score';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';

type PeriodType = 'day' | 'week' | 'month' | 'custom';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');

  useAnalyticsScreen('Dashboard');

  // Mock data based on selected period
  const executionData = useMemo(() => {
    switch (selectedPeriod) {
      case 'day':
        return { score: 94, percentageChange: 2.3 };
      case 'week':
        return { score: 88, percentageChange: 5.1 };
      case 'month':
        return { score: 91, percentageChange: -1.2 };
      case 'custom':
        return { score: 85, percentageChange: 0 };
      default:
        return { score: 94, percentageChange: 2.3 };
    }
  }, [selectedPeriod]);

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
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Daily Execution Score */}
        <DailyExecutionScore
          score={executionData.score}
          percentageChange={executionData.percentageChange}
          period={selectedPeriod}
        />
      </ScrollView>
    </View>
  );
}
