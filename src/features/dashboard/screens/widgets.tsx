import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionList, Text, View } from 'react-native';

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

  const sections = [
    {
      title: t('widgets.category.activePerformance'),
      data: WIDGET_CONFIGS.filter(
        (widget) => widget.category === WidgetCategory.ACTIVE_PERFORMANCE
      ),
    },
    {
      title: t('widgets.category.insights'),
      data: WIDGET_CONFIGS.filter((widget) => widget.category === WidgetCategory.INSIGHTS),
    },
    // Uncomment to add System Monitoring section
    // {
    //   title: t('widgets.category.systemMonitoring'),
    //   data: WIDGET_CONFIGS.filter(
    //     (widget) => widget.category === WidgetCategory.SYSTEM_MONITORING
    //   ),
    // },
  ].filter((section) => section.data.length > 0);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 pb-6"
        // contentContainerStyle={{ paddingBottom: 18 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={() => (
          <View className="px-1">
            <Text className="mb-1 text-2xl font-bold text-[#0F1621] dark:text-white">
              {t('widgets.availableWidgets')}
            </Text>
            <Text className="text-sm leading-relaxed text-slate-500 dark:text-gray-400">
              {t('widgets.description')}
            </Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="mb-3 mt-6 px-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-gray-500">
            {title}
          </Text>
        )}
        renderItem={({ item: widget, section, index }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;

          return (
            <View
              className={`overflow-hidden border-slate-200 bg-white dark:border-gray-800 dark:bg-[#1a2233] ${
                isFirst ? 'rounded-t-2xl border-t' : ''
              } ${isLast ? 'rounded-b-2xl border-b' : ''} border-x`}
            >
              {index > 0 && <View className="h-px bg-slate-50 dark:bg-[#232f48]" />}
              <WidgetToggle
                icon={widget.icon}
                titleKey={widget.titleKey}
                descriptionKey={widget.descriptionKey}
                enabled={enabledWidgets.has(widget.id)}
                onToggle={() => toggleWidget(widget.id)}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
