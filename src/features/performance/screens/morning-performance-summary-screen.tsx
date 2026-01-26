import { useCallback, useEffect, useState } from 'react';

import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHandler, ScrollView, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { Header } from '@/components/header';
import * as achievementService from '@/db/functions/achievements';
import { AchievementUnlockModal } from '@/features/achievements/components/achievement-unlock-modal';
import { useAchievementCheck } from '@/features/achievements/hooks/use-achievement-check';
import { PerformanceFooter } from '@/features/performance/components/performance-footer';
import { PerformanceHero } from '@/features/performance/components/performance-hero';
import { PerformanceMetricsGrid } from '@/features/performance/components/performance-metrics-grid';
import { PerformanceTrends } from '@/features/performance/components/performance-trends';
import { usePerformanceActions } from '@/features/performance/hooks/use-performance-actions';
import { usePerformanceData } from '@/features/performance/hooks/use-performance-data';
import { FeatureGate } from '@/features/subscription/components/feature-gate';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';

export default function MorningPerformanceSummaryScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  useAnalyticsScreen('Performance Summary');

  // Get all performance data through custom hook
  const { isLoading, refetch, ...metrics } = usePerformanceData();

  // Achievement unlock state
  const { checkAllAchievements } = useAchievementCheck();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<{
    id: string;
    tier: string;
    icon: string;
  } | null>(null);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      void refetch();

      // Check for achievement unlocks
      void checkAllAchievements()
        .then(async (newUnlocks) => {
          if (newUnlocks.length > 0) {
            const firstUnlock = newUnlocks[0];
            const achievement = await achievementService.getAchievementById(firstUnlock);
            if (achievement) {
              setUnlockedAchievement({
                id: achievement.id,
                tier: achievement.tier,
                icon: achievement.icon,
              });
              setShowUnlockModal(true);
              AnalyticsEvents.achievementUnlocked(achievement.id, achievement.tier);
            }
          }
          return;
        })
        .catch((error) => {
          console.error('[MorningPerformanceSummary] Failed to check achievements:', error);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
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
      <Header title={t('performance.summary')} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pb-8 pt-4">
          <PerformanceHero targetTime={metrics.targetTime} actualTime={metrics.actualTime} />

          <PerformanceMetricsGrid
            currentStreak={metrics.currentStreak}
            streakGain={metrics.streakGain}
            averageCognitiveScore={metrics.averageCognitiveScore}
            scoreGain={metrics.scoreGain}
          />

          {/* Performance Trends - Premium Feature */}
          <FeatureGate featureName="advanced_stats" upgradeMessage={t('featureGate.advancedStats')}>
            <PerformanceTrends
              weeklyExecutionRate={metrics.weeklyExecutionRate}
              previousWeekExecutionRate={metrics.previousWeekExecutionRate}
              currentReactionTime={metrics.currentReactionTime}
              recentReactionTimes={metrics.recentReactionTimes}
              averageReactionTime={metrics.averageReactionTime}
              isBestReactionTime={metrics.isBestReactionTime}
            />
          </FeatureGate>
        </View>
      </ScrollView>

      <PerformanceFooter onStartDay={handleStartDay} bottomInset={insets.bottom} />

      {/* Achievement Unlock Modal */}
      {unlockedAchievement ? (
        <AchievementUnlockModal
          visible={showUnlockModal}
          achievementId={unlockedAchievement.id}
          tier={unlockedAchievement.tier}
          icon={unlockedAchievement.icon}
          onClose={() => setShowUnlockModal(false)}
        />
      ) : null}
    </View>
  );
}
