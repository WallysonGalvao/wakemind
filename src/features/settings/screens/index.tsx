import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Modal, Pressable, ScrollView, View } from 'react-native';

import { SectionHeader } from '@/components/settings/section-header';
import { SettingItem } from '@/components/settings/setting-item';
import { Text } from '@/components/ui/text';
import { useSettingsStore } from '@/stores/use-settings-store';

type ThemeMode = 'light' | 'dark' | 'system';
type SupportedLanguage = 'en' | 'pt' | 'pt-BR' | 'es';

interface OptionSelectorProps {
  visible: boolean;
  title: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function OptionSelector({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionSelectorProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onClose}
        accessibilityRole="button"
      >
        <View className="mx-6 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#1a2230]">
          <Text className="mb-6 text-center text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </Text>

          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              className="mb-2 rounded-xl border border-slate-200 bg-white p-4 active:bg-primary-500/10 dark:border-slate-700 dark:bg-[#101622]"
              accessibilityRole="button"
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-base font-semibold ${
                    selectedValue === option.value
                      ? 'text-primary-500'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                    <Text className="text-xs font-bold text-white">✓</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}

          <Pressable
            onPress={onClose}
            className="mt-4 rounded-xl bg-slate-200 p-4 active:bg-slate-300 dark:bg-slate-700 dark:active:bg-slate-600"
            accessibilityRole="button"
          >
            <Text className="text-center text-base font-semibold text-slate-700 dark:text-slate-300">
              {t('common.cancel')}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme, setTheme, language, setLanguage } = useSettingsStore();

  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const themeOptions = [
    { value: 'light', label: t('theme.light') },
    { value: 'dark', label: t('theme.dark') },
    { value: 'system', label: t('theme.system') },
  ];

  const languageOptions = [
    { value: 'en', label: t('language.english') },
    { value: 'pt', label: t('language.portuguese') },
    { value: 'es', label: t('language.spanish') },
  ];

  const getThemeLabel = (mode: ThemeMode) => {
    return themeOptions.find((opt) => opt.value === mode)?.label || t('theme.system');
  };

  const getLanguageLabel = (lang: SupportedLanguage) => {
    // Normalize pt-BR to pt for display
    const normalizedLang = lang === 'pt-BR' ? 'pt' : lang;
    return languageOptions.find((opt) => opt.value === normalizedLang)?.label || t('language.english');
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View
        className="bg-background-light/95 px-6 pb-4 dark:bg-background-dark/95"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Text className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('settings.title')}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <SectionHeader title={t('settings.appearance')} />

        <SettingItem
          icon="palette"
          title={t('theme.title')}
          description={t('theme.description')}
          value={getThemeLabel(theme)}
          onPress={() => setShowThemeSelector(true)}
        />

        {/* Language Section */}
        <SectionHeader title={t('settings.language')} />

        <SettingItem
          icon="language"
          title={t('language.title')}
          description={t('language.description')}
          value={getLanguageLabel(language)}
          onPress={() => setShowLanguageSelector(true)}
        />
      </ScrollView>

      {/* Theme Selector Modal */}
      <OptionSelector
        visible={showThemeSelector}
        title={t('theme.title')}
        options={themeOptions}
        selectedValue={theme}
        onSelect={(value) => setTheme(value as ThemeMode)}
        onClose={() => setShowThemeSelector(false)}
      />

      {/* Language Selector Modal */}
      <OptionSelector
        visible={showLanguageSelector}
        title={t('language.title')}
        options={languageOptions}
        selectedValue={language === 'pt-BR' ? 'pt' : language}
        onSelect={(value) => setLanguage(value as SupportedLanguage)}
        onClose={() => setShowLanguageSelector(false)}
      />

      {/* Background Gradient Effects */}
      <View className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full">
        <View
          className="absolute -right-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary-500/5"
          style={{ filter: 'blur(120px)' }}
        />
        <View
          className="absolute -left-[10%] top-[40%] h-[300px] w-[300px] rounded-full bg-primary-500/5"
          style={{ filter: 'blur(80px)' }}
        />
      </View>
    </View>
  );
}
