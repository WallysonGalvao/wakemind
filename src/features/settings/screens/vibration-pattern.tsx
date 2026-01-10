import React, { useCallback, useEffect } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useHaptics } from 'react-native-custom-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { HAPTIC_TEST_PATTERNS } from '@/constants/haptic-patterns';
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
  intensityBars: number; // 1-4 bars to show intensity visually
}

// ============================================================================
// Constants
// ============================================================================

const VIBRATION_PATTERNS: VibrationOption[] = [
  {
    id: VibrationPattern.GENTLE,
    nameKey: 'vibration.gentle',
    descriptionKey: 'vibration.gentleDescription',
    icon: 'bedtime',
    intensityBars: 1,
  },
  {
    id: VibrationPattern.MODERATE,
    nameKey: 'vibration.moderate',
    descriptionKey: 'vibration.moderateDescription',
    icon: 'vibration',
    intensityBars: 2,
  },
  {
    id: VibrationPattern.INTENSE,
    nameKey: 'vibration.intense',
    descriptionKey: 'vibration.intenseDescription',
    icon: 'bolt',
    intensityBars: 3,
  },
  {
    id: VibrationPattern.PROGRESSIVE,
    nameKey: 'vibration.progressive',
    descriptionKey: 'vibration.progressiveDescription',
    icon: 'trending_up',
    intensityBars: 4,
  },
];

// ============================================================================
// Sub-Components
// ============================================================================

function IntensityIndicator({ bars, isActive }: { bars: number; isActive: boolean }) {
  return (
    <View className="flex-row items-end gap-0.5">
      {[1, 2, 3, 4].map((level) => (
        <View
          key={level}
          className={`w-1.5 rounded-sm ${
            level <= bars
              ? isActive
                ? 'bg-brand-primary'
                : 'bg-gray-400 dark:bg-gray-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
          style={{ height: 4 + level * 3 }}
        />
      ))}
    </View>
  );
}

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
                <Text className="text-[9px] font-bold text-brand-primary">
                  {t('common.active')}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
            {t(option.descriptionKey)}
          </Text>
        </View>
        <View className="items-center gap-1">
          <MaterialSymbol
            name={option.icon}
            size={20}
            color={
              isActive
                ? COLORS.brandPrimary
                : colorScheme === 'dark'
                  ? COLORS.gray[600]
                  : COLORS.gray[400]
            }
          />
          <IntensityIndicator bars={option.intensityBars} isActive={isActive} />
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
  const { trigger, stop } = useHaptics();

  const { vibrationPattern, setVibrationPattern } = useSettingsStore();

  // Cleanup haptics on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleTest = useCallback(
    (pattern: VibrationPattern) => {
      const testPattern = HAPTIC_TEST_PATTERNS[pattern];
      trigger(testPattern);
    },
    [trigger]
  );

  const handleSelect = useCallback(
    (pattern: VibrationPattern) => {
      setVibrationPattern(pattern);
      const testPattern = HAPTIC_TEST_PATTERNS[pattern];
      trigger(testPattern);
    },
    [setVibrationPattern, trigger]
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
