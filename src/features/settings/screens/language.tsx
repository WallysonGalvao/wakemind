import React from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/stores/use-settings-store';
import { Language } from '@/types/settings-enums';

// ============================================================================
// Types
// ============================================================================

interface LanguageOption {
  id: Language;
  /** i18n key for the translated language name */
  nameKey: string;
  /** i18n key for the native language name */
  nativeNameKey: string;
  flag: string;
}

// ============================================================================
// Constants
// ============================================================================

const LANGUAGES: LanguageOption[] = [
  {
    id: Language.EN,
    nameKey: 'language.en.name',
    nativeNameKey: 'language.en.nativeName',
    flag: '🇺🇸',
  },
  {
    id: Language.PT_BR,
    nameKey: 'language.pt-BR.name',
    nativeNameKey: 'language.pt-BR.nativeName',
    flag: '🇧🇷',
  },
  {
    id: Language.ES,
    nameKey: 'language.es.name',
    nativeNameKey: 'language.es.nativeName',
    flag: '🇪🇸',
  },
];

// ============================================================================
// Sub-Components
// ============================================================================

function LanguageItem({
  language,
  isActive,
  onSelect,
}: {
  language: LanguageOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const nativeName = t(language.nativeNameKey);
  const name = t(language.nameKey);

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={nativeName}
      accessibilityHint={`Select ${name} as app language`}
      accessibilityState={{ selected: isActive }}
      className={`mx-4 mb-3 overflow-hidden rounded-xl border p-4 ${
        isActive
          ? 'border-brand-primary ring-1 ring-brand-primary/20'
          : 'border-gray-100 dark:border-white/5'
      } bg-white shadow-sm dark:bg-surface-dark`}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-12 w-12 items-center justify-center rounded-full ${
            isActive ? 'bg-brand-primary/20' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <Text className="text-2xl">{language.flag}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-gray-900 dark:text-white">{nativeName}</Text>
            {isActive ? (
              <View className="rounded bg-brand-primary/20 px-1.5 py-0.5">
                <Text className="text-[9px] font-bold text-brand-primary">
                  {t('common.active')}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">{name}</Text>
        </View>
        {isActive ? (
          <MaterialSymbol name="check_circle" size={24} color={COLORS.brandPrimary} />
        ) : (
          <MaterialSymbol
            name="radio_button_unchecked"
            size={24}
            color={colorScheme === 'dark' ? COLORS.gray[600] : COLORS.gray[300]}
          />
        )}
      </View>
    </Pressable>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function LanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Analytics tracking
  useAnalyticsScreen('Language Settings');

  const { language, setLanguage } = useSettingsStore();

  const handleSelect = (languageId: Language) => {
    setLanguage(languageId);
    AnalyticsEvents.languageChanged(languageId);
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={t('language.title')}
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
            {t('language.availableLanguages')}
          </Text>
        </View>

        {/* Language List */}
        <View className="pb-4">
          {LANGUAGES.map((lang) => (
            <LanguageItem
              key={lang.id}
              language={lang}
              isActive={lang.id === language}
              onSelect={() => handleSelect(lang.id)}
            />
          ))}
        </View>

        {/* Footer Note */}
        <View className="mx-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
            {t('language.restartNote')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
