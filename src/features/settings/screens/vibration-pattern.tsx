import React, { useCallback } from 'react';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/stores/use-settings-store';
import { VibrationPattern } from '@/types/settings-enums';

// ============================================================================
// Types
// ============================================================================

interface VibrationOption {
  id: VibrationPattern;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  category: 'impact' | 'notification';
}

// ============================================================================
// Constants
// ============================================================================

const VIBRATION_PATTERNS: VibrationOption[] = [
  {
    id: VibrationPattern.LIGHT,
    nameKey: 'vibration.light',
    descriptionKey: 'vibration.lightDescription',
    icon: 'brightness_low',
    category: 'impact',
  },
  {
    id: VibrationPattern.MEDIUM,
    nameKey: 'vibration.medium',
    descriptionKey: 'vibration.mediumDescription',
    icon: 'brightness_medium',
    category: 'impact',
  },
  {
    id: VibrationPattern.HEAVY,
    nameKey: 'vibration.heavy',
    descriptionKey: 'vibration.heavyDescription',
    icon: 'brightness_high',
    category: 'impact',
  },
  {
    id: VibrationPattern.SUCCESS,
    nameKey: 'vibration.success',
    descriptionKey: 'vibration.successDescription',
    icon: 'check_circle',
    category: 'notification',
  },
  {
    id: VibrationPattern.WARNING,
    nameKey: 'vibration.warning',
    descriptionKey: 'vibration.warningDescription',
    icon: 'warning',
    category: 'notification',
  },
  {
    id: VibrationPattern.ERROR,
    nameKey: 'vibration.error',
    descriptionKey: 'vibration.errorDescription',
    icon: 'error',
    category: 'notification',
  },
];

// ============================================================================
// Helpers
// ============================================================================

const triggerHaptic = async (pattern: VibrationPattern) => {
  switch (pattern) {
    case VibrationPattern.LIGHT:
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case VibrationPattern.MEDIUM:
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case VibrationPattern.HEAVY:
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case VibrationPattern.SUCCESS:
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case VibrationPattern.WARNING:
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case VibrationPattern.ERROR:
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
  }
};

// ============================================================================
// Sub-Components
// ============================================================================

function VibrationItem({
  option,
  isActive,
  onTest,
  onSelect,
}: {
  option: VibrationOption;
  isActive: boolean;
  onTest: () => void;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const getCategoryColor = () => {
    return option.category === 'impact' ? COLORS.blue[500] : COLORS.indigo[400];
  };

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={t(option.nameKey)}
      accessibilityHint={`Select ${t(option.nameKey)} as vibration pattern`}
      accessibilityState={{ selected: isActive }}
      className={`mx-4 mb-3 overflow-hidden rounded-xl border p-4 ${
        isActive
          ? 'border-brand-primary ring-1 ring-brand-primary/20'
          : 'border-gray-100 dark:border-white/5'
      } bg-white shadow-sm dark:bg-surface-dark`}
    >
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onTest();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('vibration.test')}
          accessibilityHint={`Test ${t(option.nameKey)} vibration`}
          className={`h-12 w-12 items-center justify-center rounded-full ${
            isActive ? 'bg-brand-primary/20' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <MaterialSymbol
            name="vibration"
            size={24}
            color={
              isActive
                ? COLORS.brandPrimary
                : colorScheme === 'dark'
                  ? COLORS.white
                  : COLORS.gray[600]
            }
          />
        </Pressable>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-gray-900 dark:text-white">{t(option.nameKey)}</Text>
            {isActive ? (
              <View className="rounded bg-brand-primary/20 px-1.5 py-0.5">
                <Text className="text-[9px] font-bold text-brand-primary">ACTIVE</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: getCategoryColor() }} className="text-xs font-medium">
            {t(`vibration.category.${option.category}`)}
          </Text>
          <Text className="mt-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
            {t(option.descriptionKey)}
          </Text>
        </View>
        <View className="h-8 w-8 items-center justify-center">
          <MaterialSymbol
            name={option.icon}
            size={24}
            color={
              isActive
                ? COLORS.brandPrimary
                : colorScheme === 'dark'
                  ? COLORS.gray[600]
                  : COLORS.gray[400]
            }
          />
        </View>
      </View>
    </Pressable>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function VibrationPatternScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { vibrationPattern, setVibrationPattern } = useSettingsStore();

  const handleTest = useCallback(async (pattern: VibrationPattern) => {
    await triggerHaptic(pattern);
  }, []);

  const handleSelect = useCallback(
    async (pattern: VibrationPattern) => {
      setVibrationPattern(pattern);
      await triggerHaptic(pattern);
    },
    [setVibrationPattern]
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={t('vibration.title')}
          leftIcons={[
            {
              icon: (
                <MaterialSymbol
                  name="arrow_back"
                  size={24}
                  className="text-slate-900 dark:text-white"
                />
              ),
              onPress: () => router.back(),
              accessibilityLabel: t('common.back'),
            },
          ]}
        />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 pb-10" showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View className="mb-2 flex-row items-end justify-between px-4">
          <Text className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {t('vibration.availablePatterns')}
          </Text>
        </View>

        {/* Pattern List */}
        <View className="pb-4">
          {VIBRATION_PATTERNS.map((option) => (
            <VibrationItem
              key={option.id}
              option={option}
              isActive={option.id === vibrationPattern}
              onTest={() => handleTest(option.id)}
              onSelect={() => handleSelect(option.id)}
            />
          ))}
        </View>

        {/* Footer Note */}
        <View className="mx-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
            {t('vibration.tapToTest')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
