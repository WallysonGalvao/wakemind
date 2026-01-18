import { useEffect } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { PerformanceFooter } from '@/features/performance/components/performance-footer';
import { PerformanceHeader } from '@/features/performance/components/performance-header';
import { PerformanceHero } from '@/features/performance/components/performance-hero';
import { PerformanceMetricsGrid } from '@/features/performance/components/performance-metrics-grid';
import { PerformanceTrends } from '@/features/performance/components/performance-trends';
import { usePerformanceActions } from '@/features/performance/hooks/use-performance-actions';
import { usePerformanceData } from '@/features/performance/hooks/use-performance-data';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';

export default function MorningPerformanceSummaryScreen() {
  const insets = useSafeAreaInsets();

  useAnalyticsScreen('Performance Summary');

  // Get all performance data through custom hook
  const metrics = usePerformanceData();

  // Get action handlers
  const { handleClose, handleShare, handleStartDay } = usePerformanceActions({
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

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <PerformanceHeader onClose={handleClose} onShare={handleShare} topInset={insets.top} />

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
