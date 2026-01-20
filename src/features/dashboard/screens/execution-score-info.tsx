import React, { useCallback, useLayoutEffect } from 'react';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

interface MetricCardProps {
  index: number;
  icon: string;
  label: string;
  title: string;
  description: string;
  weight: number;
  isLast?: boolean;
}

function MetricCard({
  index,
  icon,
  label,
  title,
  description,
  weight,
  isLast = false,
}: MetricCardProps) {
  return (
    <View className={`flex-row gap-6 ${!isLast ? 'pb-10' : ''} relative`}>
      <View className="relative shrink-0">
        <View className="size-10 shrink-0 rounded-full border-2 border-brand-primary bg-white shadow-sm">
          <View className="flex size-full items-center justify-center">
            <MaterialSymbol name={icon} size={20} className="text-brand-primary" />
          </View>
        </View>
      </View>
      <View className="flex-1 pt-1">
        <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-primary">
          {String(index).padStart(2, '0')}. {label}
        </Text>
        <Text className="mb-2 text-lg font-bold leading-tight text-slate-900 dark:text-white">
          {title}
        </Text>
        <Text className="mb-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </Text>
        <View className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-transparent dark:bg-surface-dark">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium text-slate-900 dark:text-white">
              Impact Weight
            </Text>
            <Text className="text-xs font-bold text-slate-900 dark:text-white">{weight}%</Text>
          </View>
          <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <View
              className="h-full rounded-full bg-slate-900 dark:bg-white"
              style={{ width: `${weight}%` }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ExecutionScoreInfoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('dashboard.executionScore.infoModal.title'),
      headerLeft: () => (
        <Pressable accessibilityRole="button" onPress={handleClose} className="p-2">
          <MaterialSymbol name="close" size={24} className="text-slate-900 dark:text-white" />
        </Pressable>
      ),
    });
  }, [navigation, t, handleClose]);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="mb-8 px-6 pt-6">
          <Text className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
            {t('dashboard.executionScore.infoModal.missionParameters')}
          </Text>
          <Text className="mb-2 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
            {t('dashboard.executionScore.infoModal.title')}
          </Text>
          <Text className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t('dashboard.executionScore.infoModal.description')}
          </Text>
        </View>

        {/* Metrics */}
        <View className="relative px-6">
          {/* Vertical Line */}
          <View className="absolute bottom-6 left-[43px] top-6 z-0 w-[2px] bg-slate-200 dark:bg-slate-700" />

          <View className="relative z-10 flex flex-col">
            <MetricCard
              index={1}
              icon="alarm_on"
              label={t('dashboard.executionScore.infoModal.targetSync')}
              title={t('dashboard.executionScore.infoModal.wakeConsistency.title')}
              description={t('dashboard.executionScore.infoModal.wakeConsistency.description')}
              weight={40}
            />

            <MetricCard
              index={2}
              icon="psychology"
              label={t('dashboard.executionScore.infoModal.cognitiveIgnition')}
              title={t('dashboard.executionScore.infoModal.alarmCompletion.title')}
              description={t('dashboard.executionScore.infoModal.alarmCompletion.description')}
              weight={35}
            />

            <MetricCard
              index={3}
              icon="bolt"
              label={t('dashboard.executionScore.infoModal.immediateExecution')}
              title={t('dashboard.executionScore.infoModal.snoozePenalty.title')}
              description={t('dashboard.executionScore.infoModal.snoozePenalty.description')}
              weight={25}
              isLast
            />
          </View>
        </View>

        {/* Bottom Info Card */}
        <View className="mx-6 mt-10 overflow-hidden rounded-2xl bg-slate-900 p-5 dark:bg-slate-800">
          <View className="absolute right-0 top-0 p-4 opacity-10">
            <MaterialSymbol name="verified" size={64} className="text-white" />
          </View>
          <View className="relative z-10">
            <Text className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-primary">
              {t('dashboard.executionScore.infoModal.systemOutput')}
            </Text>
            <Text className="mb-4 text-xs leading-relaxed text-slate-300">
              {t('dashboard.executionScore.infoModal.systemOutputDescription')}
            </Text>
            <View className="border-t border-white/10 pt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] font-bold uppercase text-slate-400">
                  {t('dashboard.executionScore.infoModal.targetBenchmark')}
                </Text>
                <Text className="text-xl font-bold tabular-nums text-white">95.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
