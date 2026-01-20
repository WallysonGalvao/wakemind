import React from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, Text, View } from 'react-native';

import { WidgetToggle } from '../components/widget-toggle';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWidgetStore } from '@/stores/use-widget-store';
import { WIDGET_CONFIGS, WidgetCategory } from '@/types/widgets';

export default function WidgetsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { enabledWidgets, toggleWidget, resetToDefaults } = useWidgetStore();

  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#0F1621';

  const widgetsByCategory = WIDGET_CONFIGS.reduce(
    (acc, widget) => {
      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }
      acc[widget.category].push(widget);
      return acc;
    },
    {} as Record<WidgetCategory, typeof WIDGET_CONFIGS>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={t('widgets.title')}
          leftIcons={[
            {
              icon: <MaterialSymbol name="arrow_back" size={24} color={iconColor} />,
              onPress: () => router.back(),
              accessibilityLabel: t('back'),
              accessibilityHint: 'Navigate back to previous screen',
            },
          ]}
          rightIcons={[
            {
              icon: <MaterialSymbol name="restart_alt" size={24} color={iconColor} />,
              onPress: resetToDefaults,
              accessibilityLabel: 'Reset to defaults',
              accessibilityHint: 'Reset all widget settings to default values',
            },
          ]}
        />
      </View>

      {/* Content */}
      <ScrollView className="flex-1" contentContainerClassName="gap-6 max-w-md mx-auto w-full">
        {/* Introduction */}
        <View className="mt-2 px-1">
          <Text className="mb-1 text-2xl font-bold text-[#0F1621] dark:text-white">
            {t('widgets.availableWidgets')}
          </Text>
          <Text className="text-sm leading-relaxed text-slate-500 dark:text-gray-400">
            {t('widgets.description')}
          </Text>
        </View>

        {/* Active Performance Section */}
        <View>
          <Text className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-gray-500">
            {t('widgets.category.activePerformance')}
          </Text>
          <View className="divide-y divide-slate-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-[#232f48] dark:border-gray-800 dark:bg-[#1a2233]">
            {widgetsByCategory[WidgetCategory.ACTIVE_PERFORMANCE]?.map((widget) => (
              <WidgetToggle
                key={widget.id}
                icon={widget.icon}
                titleKey={widget.titleKey}
                descriptionKey={widget.descriptionKey}
                enabled={enabledWidgets.has(widget.id)}
                onToggle={() => toggleWidget(widget.id)}
              />
            ))}
          </View>
        </View>

        {/* Insights Section */}
        <View>
          <Text className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-gray-500">
            {t('widgets.category.insights')}
          </Text>
          <View className="divide-y divide-slate-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-[#232f48] dark:border-gray-800 dark:bg-[#1a2233]">
            {widgetsByCategory[WidgetCategory.INSIGHTS]?.map((widget) => (
              <WidgetToggle
                key={widget.id}
                icon={widget.icon}
                titleKey={widget.titleKey}
                descriptionKey={widget.descriptionKey}
                enabled={enabledWidgets.has(widget.id)}
                onToggle={() => toggleWidget(widget.id)}
              />
            ))}
          </View>
        </View>

        {/* System Monitoring Section */}
        <View>
          <Text className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-gray-500">
            {t('widgets.category.systemMonitoring')}
          </Text>
          <View className="divide-y divide-slate-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-[#232f48] dark:border-gray-800 dark:bg-[#1a2233]">
            {widgetsByCategory[WidgetCategory.SYSTEM_MONITORING]?.map((widget) => (
              <WidgetToggle
                key={widget.id}
                icon={widget.icon}
                titleKey={widget.titleKey}
                descriptionKey={widget.descriptionKey}
                enabled={enabledWidgets.has(widget.id)}
                onToggle={() => toggleWidget(widget.id)}
              />
            ))}
          </View>
        </View>

        {/* Bottom padding for FAB */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
