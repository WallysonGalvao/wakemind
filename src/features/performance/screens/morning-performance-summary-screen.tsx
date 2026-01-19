import { useCallback, useEffect } from 'react';

import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHandler, ScrollView, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { Header } from '@/components/header';
import { PerformanceFooter } from '@/features/performance/components/performance-footer';
import { PerformanceHero } from '@/features/performance/components/performance-hero';
import { PerformanceMetricsGrid } from '@/features/performance/components/performance-metrics-grid';
import { PerformanceTrends } from '@/features/performance/components/performance-trends';
import { usePerformanceActions } from '@/features/performance/hooks/use-performance-actions';
import { usePerformanceData } from '@/features/performance/hooks/use-performance-data';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';

export default function MorningPerformanceSummaryScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  useAnalyticsScreen('Performance Summary');

  // Get all performance data through custom hook
  const { isLoading, refetch, ...metrics } = usePerformanceData();

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Get action handlers
  const { handleStartDay } = usePerformanceActions({
    currentStreak: metrics.currentStreak,
    averageCognitiveScore: metrics.averageCognitiveScore,
    weeklyExecutionRate: metrics.weeklyExecutionRate,
    targetTime: metrics.targetTime,
    actualTime: metrics.actualTime,
  });

  // Track performance summary viewed
  useEffect(() => {
    AnalyticsEvents.performanceSummaryViewed(
      metrics.currentStreak,
      metrics.averageCognitiveScore,
      metrics.weeklyExecutionRate
    );
  }, [metrics.currentStreak, metrics.averageCognitiveScore, metrics.weeklyExecutionRate]);

  // Block back button on Android and prevent navigation on iOS
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default back behavior
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingTop: insets.top }}
    >
      <Header
        title={t('performance.summary')}
        // leftIcons={[
        //   {
        //     icon: (
        //       <MaterialSymbol name="close" size={28} className="text-slate-900 dark:text-white" />
        //     ),
        //     onPress: handleClose,
        //     accessibilityLabel: t('common.close'),
        //     accessibilityHint: t('performance.a11y.closeHint'),
        //   },
        // ]}
        // rightIcons={[
        //   {
        //     icon: (
        //       <MaterialSymbol name="share" size={24} className="text-slate-900 dark:text-white" />
        //     ),
        //     onPress: handleShare,
        //     accessibilityLabel: t('common.share'),
        //     accessibilityHint: t('performance.a11y.shareHint'),
        //   },
        // ]}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pb-8 pt-4">
          <PerformanceHero targetTime={metrics.targetTime} actualTime={metrics.actualTime} />

          <PerformanceMetricsGrid
            currentStreak={metrics.currentStreak}
            streakGain={metrics.streakGain}
            averageCognitiveScore={metrics.averageCognitiveScore}
            scoreGain={metrics.scoreGain}
          />

          <PerformanceTrends
            weeklyExecutionRate={metrics.weeklyExecutionRate}
            previousWeekExecutionRate={metrics.previousWeekExecutionRate}
            currentReactionTime={metrics.currentReactionTime}
            recentReactionTimes={metrics.recentReactionTimes}
            averageReactionTime={metrics.averageReactionTime}
            isBestReactionTime={metrics.isBestReactionTime}
          />
        </View>
      </ScrollView>

      <PerformanceFooter onStartDay={handleStartDay} bottomInset={insets.bottom} />
    </View>
  );
}
