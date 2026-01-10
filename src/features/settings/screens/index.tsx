import React from 'react';

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { ALARM_TONES } from '@/constants/alarm-tones';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/stores/use-settings-store';
import type { VibrationPattern } from '@/types/settings-enums';
import { Language, ThemeMode } from '@/types/settings-enums';

// ============================================================================
// Types
// ============================================================================

interface SettingRowProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value?: string;
  onPress?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

interface SettingToggleRowProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

// ============================================================================
// Sub-Components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {title}
    </Text>
  );
}

function SectionFooter({ text }: { text: string }) {
  return <Text className="px-4 pt-2 text-xs text-gray-500">{text}</Text>;
}

function SettingRow({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  onPress,
  isFirst = false,
  isLast = false,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center gap-4 bg-white px-4 py-3 dark:bg-[#1a2233] ${
        !isLast ? 'border-b border-gray-100 dark:border-[#232f48]' : ''
      }`}
    >
      <View className={`h-8 w-8 items-center justify-center rounded-full ${iconBgColor}`}>
        <MaterialSymbol name={icon} size={20} color={iconColor} />
      </View>
      <Text className="flex-1 text-base font-medium text-gray-900 dark:text-white">{title}</Text>
      <View className="flex-row items-center gap-2">
        {value ? <Text className="text-sm text-gray-500">{value}</Text> : null}
        <MaterialSymbol name="chevron_right" size={18} color={COLORS.gray[400]} />
      </View>
    </Pressable>
  );
}

function SettingToggleRow({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  onValueChange,
  isFirst = false,
  isLast = false,
}: SettingToggleRowProps) {
  return (
    <View
      className={`flex-row items-center gap-4 bg-white px-4 py-3 dark:bg-[#1a2233] ${
        !isLast ? 'border-b border-gray-100 dark:border-[#232f48]' : ''
      }`}
    >
      <View className={`h-8 w-8 items-center justify-center rounded-full ${iconBgColor}`}>
        <MaterialSymbol name={icon} size={20} color={iconColor} />
      </View>
      <Text className="flex-1 text-base font-medium text-gray-900 dark:text-white">{title}</Text>
      <View className="items-center justify-center">
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.gray[300], true: COLORS.brandPrimary }}
          thumbColor={COLORS.white}
        />
      </View>
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-xl border border-gray-100 shadow-sm dark:border-gray-800">
      {children}
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { theme, setTheme, language, alarmToneId, vibrationPattern } = useSettingsStore();

  const version = Constants.expoConfig?.version || '0.0.0';

  // Derived state
  const isDarkMode =
    theme === ThemeMode.DARK || (theme === ThemeMode.SYSTEM && colorScheme === 'dark');

  const selectedToneName =
    ALARM_TONES.find((tone) => tone.id === alarmToneId)?.name ?? 'Classic Alert';

  const getLanguageLabel = (lang: Language) => {
    const labels: Record<Language, string> = {
      [Language.EN]: 'English',
      [Language.PT]: 'Português',
      [Language.PT_BR]: 'Português',
      [Language.ES]: 'Español',
    };
    return labels[lang] || 'English';
  };

  const getVibrationLabel = (pattern: VibrationPattern) => {
    return t(`vibration.${pattern}`);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setTheme(value ? ThemeMode.DARK : ThemeMode.LIGHT);
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header title={t('settings.title')} />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View className="mb-2">
          <SectionHeader title={t('settings.appearance')} />
          <SectionCard>
            <SettingToggleRow
              icon="contrast"
              iconBgColor="bg-gray-100 dark:bg-gray-700/30"
              iconColor={colorScheme === 'dark' ? COLORS.gray[300] : COLORS.gray[600]}
              title={t('theme.darkMode')}
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              isFirst
              isLast
            />
          </SectionCard>
        </View>

        {/* Language Section */}
        <View className="mb-2 mt-8">
          <SectionHeader title={t('settings.language')} />
          <SectionCard>
            <SettingRow
              icon="language"
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor={COLORS.blue[500]}
              title={t('language.title')}
              value={getLanguageLabel(language)}
              onPress={() => router.push('/settings/language')}
              isFirst
              isLast
            />
          </SectionCard>
        </View>

        {/* Sound & Haptics Section */}
        <View className="mb-2 mt-8">
          <SectionHeader title={t('settings.soundHaptics')} />
          <SectionCard>
            <SettingRow
              icon="notifications_active"
              iconBgColor="bg-red-100 dark:bg-red-900/30"
              iconColor={COLORS.red[500]}
              title={t('settings.alarmTone')}
              value={selectedToneName}
              onPress={() => router.push('/settings/alarm-tone')}
              isFirst
            />
            <SettingToggleRow
              icon="check_circle"
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor={COLORS.green[500]}
              title={t('settings.vibrateOnSuccess')}
              value
              onValueChange={() => {}}
            />
            <SettingRow
              icon="vibration"
              iconBgColor="bg-orange-100 dark:bg-orange-900/30"
              iconColor={COLORS.orange[500]}
              title={t('settings.vibrationPattern')}
              value={getVibrationLabel(vibrationPattern)}
              onPress={() => router.push('/settings/vibration-pattern')}
              isLast
            />
          </SectionCard>
        </View>

        {/* Behavior Section */}
        <View className="mb-2 mt-8">
          <SectionHeader title={t('settings.behavior')} />
          <SectionCard>
            <SettingToggleRow
              icon="lock_clock"
              iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor={COLORS.indigo[400]}
              title={t('settings.snoozeProtection')}
              value
              onValueChange={() => {}}
              isFirst
            />
            <SettingToggleRow
              icon="screen_lock_landscape"
              iconBgColor="bg-teal-100 dark:bg-teal-900/30"
              iconColor={COLORS.teal[500]}
              title={t('settings.preventAutoLock')}
              value
              onValueChange={() => {}}
              isLast
            />
          </SectionCard>
          <SectionFooter text={t('settings.preventAutoLockDescription')} />
        </View>

        {/* App Info */}
        <View className="mb-10 mt-8 items-center justify-center gap-2">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-600">
            WakeMind v{version}
          </Text>
          <View className="flex-row gap-4">
            <Pressable accessibilityRole="link">
              <Text className="text-xs font-semibold text-primary-500">
                {t('settings.privacyPolicy')}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="link">
              <Text className="text-xs font-semibold text-primary-500">
                {t('settings.support')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
