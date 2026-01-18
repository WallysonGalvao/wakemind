import { useEffect } from 'react';

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
    completionHistory,
  } = usePerformanceStore();

  const currentStreak = getCurrentStreak();
  const averageCognitiveScore = getAverageCognitiveScore();
  const weeklyStats = getWeeklyStats();
  const recentReactionTimes = getRecentReactionTimes(6);

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
    ? new Date(lastCompletion.actualTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '05:02';

  const currentReactionTime = lastCompletion?.reactionTime || 240;

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
        className="flex-row items-center justify-between bg-background-light/90 px-4 backdrop-blur-md dark:bg-background-dark/90"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Pressable
          onPress={handleClose}
          className="flex size-12 shrink-0 items-center justify-start transition-opacity active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          accessibilityHint="Closes the performance summary and returns to home"
        >
          <MaterialSymbol name="close" size={28} className="text-slate-900 dark:text-white" />
        </Pressable>

        <Text className="flex-1 text-center text-sm font-bold uppercase tracking-widest text-slate-900/80 dark:text-white/80">
          {t('performance.summary')}
        </Text>

        <View className="flex w-12 items-center justify-end">
          <Pressable
            onPress={handleShare}
            className="flex h-12 items-center justify-center overflow-hidden rounded-lg bg-transparent transition-opacity active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={t('common.share')}
            accessibilityHint="Share your performance summary"
          >
            <MaterialSymbol name="share" size={24} className="text-slate-900 dark:text-white" />
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pb-8 pt-2">
          {/* Hero / Status */}
          <View className="mb-8 flex-col items-center justify-center">
            {/* Icon with glow */}
            <View className="relative mb-4">
              <View className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl" />
              <MaterialSymbol
                name="check_circle"
                size={60}
                className="relative z-10 text-primary-500"
              />
            </View>

            {/* Badge */}
            <View className="mb-3 flex-row items-center gap-2">
              <View className="border-success/20 bg-success/10 flex h-7 flex-row items-center justify-center gap-x-2 rounded-full border px-3">
                <MaterialSymbol name="alarm_on" size={18} className="text-success" />
                <Text className="text-success text-xs font-bold uppercase tracking-wide">
                  {t('performance.wakeUpSuccess')}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="mb-2 text-center text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
              {t('performance.missionAccomplished')}
            </Text>

            {/* Time comparison */}
            <View className="rounded-full bg-slate-200 px-4 py-1.5 dark:bg-white/5">
              <Text className="text-center text-sm font-medium leading-normal text-slate-500 dark:text-slate-400">
                {t('performance.target')}:{' '}
                <Text className="font-bold text-slate-900 dark:text-white">{targetTime}</Text>{' '}
                <Text className="mx-1 text-slate-400">|</Text> {t('performance.actual')}:{' '}
                <Text className="text-success font-bold">{actualTime}</Text>
              </Text>
            </View>
          </View>

          {/* Primary Metrics Grid */}
          <View className="mb-6 grid grid-cols-2 gap-4">
            <MetricCard
              icon="local_fire_department"
              iconColor="text-orange-500"
              iconBgColor="bg-orange-500/10"
              title={t('performance.streak')}
              value={currentStreak}
              subtitle={t('performance.daysConsistent')}
              badge={{ text: '+1 day', color: 'text-success' }}
            />

            <MetricCard
              icon="psychology"
              iconColor="text-primary-500"
              iconBgColor="bg-primary-500/10"
              title={t('performance.score')}
              value={averageCognitiveScore}
              subtitle={t('performance.outOf100')}
              badge={{ text: '+5 pts', color: 'text-success' }}
            />
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
                  : [300, 280, 290, 270, 260, 240]
              }
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
          className="flex h-14 w-full flex-row items-center justify-center gap-2 rounded-lg bg-primary-500 shadow-lg shadow-primary-500/25 transition-transform active:scale-[0.98]"
          accessibilityRole="button"
        >
          <Text className="text-base font-bold text-white">{t('performance.startDay')}</Text>
          <MaterialSymbol name="arrow_forward" size={24} className="text-white" />
        </Pressable>

        <Text className="mt-3 text-center text-[10px] font-medium text-slate-400 opacity-60">
          "{t('performance.quote')}"
        </Text>
      </View>
    </View>
  );
}
