import { useEffect } from 'react';

import dayjs from 'dayjs';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, Share, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { MetricCard } from '@/features/performance/components/metric-card';
import { ProgressBarCard } from '@/features/performance/components/progress-bar-card';
import { TrendChartCard } from '@/features/performance/components/trend-chart-card';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import { usePerformanceStore } from '@/stores/use-performance-store';

export default function MorningPerformanceSummaryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useAnalyticsScreen('Performance Summary');

  const {
    getCurrentStreak,
    getAverageCognitiveScore,
    getWeeklyStats,
    getRecentReactionTimes,
    getStreakGain,
    getScoreGain,
    completionHistory,
  } = usePerformanceStore();

  const currentStreak = getCurrentStreak();
  const averageCognitiveScore = getAverageCognitiveScore();
  const weeklyStats = getWeeklyStats();
  const recentReactionTimes = getRecentReactionTimes(7);
  const streakGain = getStreakGain();
  const scoreGain = getScoreGain();

  // Track performance summary viewed
  useEffect(() => {
    AnalyticsEvents.performanceSummaryViewed(
      currentStreak,
      averageCognitiveScore,
      weeklyStats.executionRate
    );
  }, [currentStreak, averageCognitiveScore, weeklyStats.executionRate]);

  // Get last completion
  const lastCompletion = completionHistory[completionHistory.length - 1];
  const targetTime = lastCompletion?.targetTime || '05:00';
  const actualTime = lastCompletion?.actualTime
    ? dayjs(lastCompletion.actualTime).format('HH:mm')
    : '05:02';

  const currentReactionTime = lastCompletion?.reactionTime || 240;
  const averageReactionTime =
    recentReactionTimes.length > 0
      ? Math.round(recentReactionTimes.reduce((a, b) => a + b, 0) / recentReactionTimes.length)
      : 258;
  const isBestReactionTime = currentReactionTime <= Math.min(...recentReactionTimes, 999);
  const shadowStyle = useShadowStyle('sm');
  const shadowStyleLg = useShadowStyle('lg');

  const handleClose = () => {
    router.replace('/(tabs)');
  };

  const handleShare = async () => {
    try {
      const message =
        `🎯 ${t('performance.missionAccomplished')}!\n\n` +
        `🔥 ${t('performance.streak')}: ${currentStreak} ${t('performance.daysConsistent').toLowerCase()}\n` +
        `🧠 ${t('performance.score')}: ${averageCognitiveScore}/100\n` +
        `📊 ${t('performance.weeklyExecution')}: ${weeklyStats.executionRate}%\n\n` +
        `⏰ ${t('performance.target')}: ${targetTime} | ${t('performance.actual')}: ${actualTime}\n\n` +
        `${t('performance.quote')}`;

      await Share.share({
        message,
      });

      AnalyticsEvents.performanceSummaryShared();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartDay = () => {
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View
        className="flex-row items-center justify-between border-b border-slate-200/50 bg-background-light/95 px-4 backdrop-blur-md dark:border-white/5 dark:bg-background-dark/90"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Pressable
          onPress={handleClose}
          className="flex size-12 shrink-0 items-center justify-start transition-opacity active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          accessibilityHint={t('performance.a11y.closeHint')}
        >
          <MaterialSymbol name="close" size={28} className="text-slate-900 dark:text-white" />
        </Pressable>

        <Text className="flex-1 text-center text-xs font-extrabold uppercase tracking-widest text-slate-900/70 dark:text-white/80">
          {t('performance.summary')}
        </Text>

        <View className="flex w-12 items-center justify-end">
          <Pressable
            onPress={handleShare}
            className="flex h-12 items-center justify-center overflow-hidden rounded-lg bg-transparent transition-opacity active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={t('common.share')}
            accessibilityHint={t('performance.a11y.shareHint')}
          >
            <MaterialSymbol name="share" size={24} className="text-slate-900 dark:text-white" />
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pb-8 pt-4">
          {/* Hero / Status */}
          <View className="mb-8 flex-col items-center justify-center">
            {/* Icon with background circle */}
            <View className="relative mb-5">
              {/* Glow effect */}
              <View className="absolute inset-0 scale-150 rounded-full bg-success-500/20 blur-2xl" />
              {/* Green circle background with check icon */}
              <View
                style={shadowStyleLg}
                className="relative z-10 h-20 w-20 items-center justify-center rounded-full bg-success-500"
              >
                <MaterialSymbol name="check" size={48} className="text-white" />
              </View>
            </View>

            {/* Badge */}
            <View className="mb-4 flex-row items-center gap-2">
              <View className="flex h-8 flex-row items-center justify-center gap-x-2 rounded-full border border-success-500/20 bg-success-500/10 px-4">
                <MaterialSymbol name="alarm_on" size={20} className="text-success-500" />
                <Text className="text-xs font-bold uppercase tracking-wide text-success-500">
                  {t('performance.wakeUpSuccess')}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="mb-4 text-center text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              {t('performance.missionAccomplished')}
            </Text>

            {/* Time comparison */}
            <View
              style={shadowStyle}
              className="flex-row items-center justify-center gap-4 rounded-full border border-slate-200 bg-white px-6 py-2 dark:border-white/5 dark:bg-surface-dark"
            >
              <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('performance.target')}:{' '}
                <Text className="font-bold text-slate-900 dark:text-white">{targetTime}</Text>
              </Text>
              <View className="h-4 w-px bg-slate-200 dark:bg-white/10" />
              <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('performance.actual')}:{' '}
                <Text className="font-bold text-success-500">{actualTime}</Text>
              </Text>
            </View>
          </View>

          {/* Primary Metrics Grid */}
          <View className="mb-6 flex-row gap-4">
            <View className="flex-1">
              <MetricCard
                icon="local_fire_department"
                iconColor="text-orange-500"
                iconBgColor="bg-orange-50"
                title={t('performance.streak')}
                value={currentStreak}
                subtitle={t('performance.daysConsistent')}
                badge={
                  streakGain > 0
                    ? {
                        text: t('performance.daysGain', { count: streakGain }),
                        color: 'text-success-500',
                      }
                    : undefined
                }
              />
            </View>

            <View className="flex-1">
              <MetricCard
                icon="psychology"
                iconColor="text-primary-500"
                iconBgColor="bg-blue-50"
                title={t('performance.score')}
                value={averageCognitiveScore}
                subtitle={t('performance.outOf100')}
                badge={
                  scoreGain > 0
                    ? {
                        text: t('performance.pointsGain', { count: scoreGain }),
                        color: 'text-success-500',
                      }
                    : scoreGain < 0
                      ? {
                          text: t('performance.pointsGain', { count: scoreGain }),
                          color: 'text-red-500',
                        }
                      : undefined
                }
              />
            </View>
          </View>

          {/* Secondary Metrics / Trends */}
          <View className="flex-col gap-4">
            <ProgressBarCard
              icon="bar_chart"
              title={t('performance.weeklyExecution')}
              value={weeklyStats.executionRate}
              previousValue={85}
            />

            <TrendChartCard
              icon="speed"
              title={t('performance.reactionSpeed')}
              currentValue={`${currentReactionTime}ms`}
              data={
                recentReactionTimes.length > 0
                  ? recentReactionTimes
                  : [320, 290, 350, 260, 280, 250, 240]
              }
              labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
              averageValue={averageReactionTime}
              isBestScore={isBestReactionTime}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer / CTA */}
      <View
        className="z-10 bg-gradient-to-t from-background-light via-background-light to-transparent p-5 dark:from-background-dark dark:via-background-dark"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <Pressable
          onPress={handleStartDay}
          style={shadowStyleLg}
          className="flex h-14 w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary-500 transition-transform active:scale-[0.98]"
          accessibilityRole="button"
        >
          <Text className="text-base font-bold text-white">{t('performance.startDay')}</Text>
          <MaterialSymbol name="arrow_forward" size={24} className="text-white" />
        </Pressable>

        <Text className="mt-4 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 opacity-70">
          "{t('performance.quote')}"
        </Text>
      </View>
    </View>
  );
}
