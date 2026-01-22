import React from 'react';

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

interface DailyInsightProps {
  insight: string | null;
}

export function DailyInsight({ insight }: DailyInsightProps) {
  const { t } = useTranslation();

  if (!insight) {
    return null;
  }

  return (
    <View className="flex-row items-start gap-3 rounded-lg border border-brand-primary/20 bg-brand-primary/10 p-3">
      <MaterialSymbol name="lightbulb" size={20} className="mt-0.5 shrink-0 text-brand-primary" />
      <View className="flex-1">
        <Text className="text-sm font-medium leading-snug text-slate-600 dark:text-gray-200">
          <Text className="font-bold text-brand-primary">{t('dashboard.dailyInsight.label')}:</Text>{' '}
          {insight}
        </Text>
      </View>
    </View>
  );
}
