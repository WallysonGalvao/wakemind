import React, { useLayoutEffect } from 'react';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Linking, Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';

// ============================================================================
// Sub-Components
// ============================================================================

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View className="mb-4 flex-row items-center gap-3">
      <MaterialSymbol name={icon} size={20} color={COLORS.brandPrimary} />
      <Text className="text-xl font-bold tracking-tight text-slate-800 dark:text-primary-500">
        {title}
      </Text>
    </View>
  );
}

function DataItem({ title, description }: { title: string; description: string }) {
  return (
    <View className="mb-4 flex-row gap-4">
      <View className="mt-1.5">
        <View className="h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary-500 bg-white shadow-sm dark:bg-background-dark">
          <View className="h-1 w-1 rounded-[1px] bg-primary-500" />
        </View>
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-sm font-semibold text-slate-800 dark:text-white">{title}</Text>
        <Text className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </Text>
      </View>
    </View>
  );
}

function NotCollectedItem({ text }: { text: string }) {
  return (
    <View className="mb-3 flex-row items-center gap-3">
      <MaterialSymbol name="block" size={20} color="#dc2626" />
      <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200">{text}</Text>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('settings.privacyPolicy'),
      headerLeft: () => (
        <Pressable accessibilityRole="button" onPress={() => router.back()} className="p-2">
          <MaterialSymbol name="arrow_back" size={24} className="text-slate-900 dark:text-white" />
        </Pressable>
      ),
    });
  }, [navigation, t, router]);

  const handleContactPress = () => {
    Linking.openURL('mailto:privacy@wakemind.app');
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Metadata Header */}
        <View className="mb-10 items-center opacity-90 dark:opacity-70">
          <View className="mb-2 h-8 w-[1px] bg-primary-500/60 dark:bg-primary-500/50" />
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-primary-500/80">
            {t('privacyPolicy.lastUpdatedLabel')}
          </Text>
          <Text className="font-mono mt-0.5 text-[11px] text-gray-500 dark:text-white/60">
            {t('privacyPolicy.lastUpdatedDate')}
          </Text>
        </View>

        {/* Section 1: Introduction */}
        <View className="mb-12">
          <SectionTitle icon="terminal" title={t('privacyPolicy.introduction.title')} />
          <Text className="text-[15px] font-normal leading-loose text-gray-700 dark:text-gray-200">
            {t('privacyPolicy.introduction.content')}
          </Text>
        </View>

        {/* Section 2: Data Collected */}
        <View className="relative mb-12">
          {/* Decorative vertical line */}
          <View className="absolute bottom-4 left-[7px] top-8 w-[1px] bg-gray-300 dark:bg-white/10" />

          <SectionTitle icon="database" title={t('privacyPolicy.dataCollected.title')} />

          <View className="pl-1">
            <DataItem
              title={t('privacyPolicy.dataCollected.localData.alarmsTitle')}
              description={t('privacyPolicy.dataCollected.localData.alarms')}
            />
            <DataItem
              title={t('privacyPolicy.dataCollected.localData.preferencesTitle')}
              description={t('privacyPolicy.dataCollected.localData.preferences')}
            />
            <DataItem
              title={t('privacyPolicy.dataCollected.localData.performanceTitle')}
              description={t('privacyPolicy.dataCollected.localData.performance')}
            />
            <DataItem
              title={t('privacyPolicy.dataCollected.localData.settingsTitle')}
              description={t('privacyPolicy.dataCollected.localData.settings')}
            />
          </View>
        </View>

        {/* Section 3: Data NOT Collected */}
        <View className="relative mb-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm dark:border-primary-500/40 dark:bg-primary-500/5">
          {/* Top/Bottom decorative lines for dark mode */}
          <View className="absolute left-0 right-0 top-0 hidden h-[1px] bg-primary-500/40 dark:flex" />
          <View className="absolute bottom-0 left-0 right-0 hidden h-[1px] bg-primary-500/40 dark:flex" />

          <View className="relative border-l-4 border-primary-500 p-6 dark:border-l-2">
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-xl font-bold tracking-tight text-slate-800 dark:text-primary-500">
                {t('privacyPolicy.dataCollected.notCollected.title')}
              </Text>
              <View className="text-gray-400 dark:text-primary-500">
                <MaterialSymbol name="shield_lock" size={24} color={COLORS.brandPrimary} />
              </View>
            </View>

            <NotCollectedItem text={t('privacyPolicy.dataCollected.notCollected.personal')} />
            <NotCollectedItem text={t('privacyPolicy.dataCollected.notCollected.location')} />
            <NotCollectedItem text={t('privacyPolicy.dataCollected.notCollected.contacts')} />
            <NotCollectedItem text={t('privacyPolicy.dataCollected.notCollected.analytics')} />

            <View className="mt-6 border-t border-gray-300 pt-4 dark:border-white/5">
              <Text className="font-mono text-xs font-medium italic text-slate-700 dark:text-primary-500/70">
                {t('privacyPolicy.dataCollected.notCollected.quote')}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Data Usage */}
        <View className="mb-12">
          <SectionTitle icon="analytics" title={t('privacyPolicy.dataUsage.title')} />
          <Text className="text-[15px] font-normal leading-loose text-gray-700 dark:text-gray-200">
            {t('privacyPolicy.dataUsage.content')}
          </Text>
        </View>

        {/* Section 5: Security */}
        <View className="mb-12">
          <SectionTitle icon="encrypted" title={t('privacyPolicy.security.title')} />
          <Text className="mb-4 text-[15px] font-normal leading-loose text-gray-700 dark:text-gray-200">
            {t('privacyPolicy.security.content')}
          </Text>
          <View className="flex-row items-center gap-2 self-start rounded border border-slate-800/10 bg-slate-800/5 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
            <MaterialSymbol name="check_circle" size={14} color="#16a34a" />
            <Text className="font-mono text-xs font-semibold text-slate-800 dark:text-gray-300">
              {t('privacyPolicy.security.badge')}
            </Text>
          </View>
        </View>

        {/* Section 6: Your Rights */}
        <View className="mb-12">
          <SectionTitle icon="gavel" title={t('privacyPolicy.rights.title')} />
          <View className="pl-1">
            <DataItem
              title={t('privacyPolicy.rights.deleteTitle')}
              description={t('privacyPolicy.rights.delete')}
            />
            <DataItem
              title={t('privacyPolicy.rights.modifyTitle')}
              description={t('privacyPolicy.rights.modify')}
            />
            <DataItem
              title={t('privacyPolicy.rights.resetTitle')}
              description={t('privacyPolicy.rights.reset')}
            />
          </View>
        </View>

        {/* Footer */}
        <View className="items-center border-t border-gray-200 pt-8 dark:border-white/5">
          <View className="text-gray-300 dark:text-white">
            <MaterialSymbol name="fingerprint" size={32} color={COLORS.gray[400]} />
          </View>
          <Text className="mb-3 mt-4 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            {t('privacyPolicy.footer.description')}
          </Text>
          <Pressable onPress={handleContactPress} accessibilityRole="link">
            <Text className="text-sm font-bold text-primary-500 underline">
              {t('privacyPolicy.footer.email')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
