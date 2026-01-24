import React, { useLayoutEffect } from 'react';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Platform, Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';

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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View className="mb-4 flex-row gap-4">
      <View className="mt-1.5">
        <View className="h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary-500 bg-white shadow-sm dark:bg-background-dark">
          <View className="h-1 w-1 rounded-[1px] bg-primary-500" />
        </View>
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-sm font-semibold text-slate-800 dark:text-white">
          {question}
        </Text>
        <Text className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{answer}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function SupportScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Analytics tracking
  useAnalyticsScreen('Support');
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('settings.support'),
      headerLeft: () => (
        <Pressable accessibilityRole="button" onPress={() => router.back()} className="p-2">
          <MaterialSymbol name="arrow_back" size={24} className="text-slate-900 dark:text-white" />
        </Pressable>
      ),
    });
  }, [navigation, t, router]);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-10 items-center opacity-90 dark:opacity-70">
          <View className="mb-2 h-8 w-[1px] bg-primary-500/60 dark:bg-primary-500/50" />
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-primary-500/80">
            {t('support.faq.title')}
          </Text>
        </View>

        {/* Section 1: Alarmes e Notificações */}
        <View className="relative mb-12">
          <View className="absolute bottom-4 left-[7px] top-8 w-[1px] bg-gray-300 dark:bg-white/10" />
          <SectionTitle icon="alarm" title={t('support.faq.alarms.title')} />
          <View className="pl-1">
            <FAQItem
              question={t('support.faq.alarms.notRinging.question')}
              answer={t('support.faq.alarms.notRinging.answer')}
            />
            <FAQItem
              question={t('support.faq.alarms.locked.question')}
              answer={t('support.faq.alarms.locked.answer')}
            />
            {Platform.OS === 'android' && (
              <>
                <FAQItem
                  question={t('support.faq.alarms.permissions.question')}
                  answer={t('support.faq.alarms.permissions.answer')}
                />
                <FAQItem
                  question={t('support.faq.alarms.autoOpen.question')}
                  answer={t('support.faq.alarms.autoOpen.answer')}
                />
              </>
            )}
            <FAQItem
              question={t('support.faq.alarms.snooze.question')}
              answer={t('support.faq.alarms.snooze.answer')}
            />
          </View>
        </View>

        {/* Section 2: Som e Vibração */}
        <View className="relative mb-12">
          <View className="absolute bottom-4 left-[7px] top-8 w-[1px] bg-gray-300 dark:bg-white/10" />
          <SectionTitle icon="volume_up" title={t('support.faq.sound.title')} />
          <View className="pl-1">
            <FAQItem
              question={t('support.faq.sound.noVibration.question')}
              answer={t('support.faq.sound.noVibration.answer')}
            />
            <FAQItem
              question={t('support.faq.sound.testTones.question')}
              answer={t('support.faq.sound.testTones.answer')}
            />
          </View>
        </View>

        {/* Section 3: Desafios Cognitivos */}
        <View className="relative mb-12">
          <View className="absolute bottom-4 left-[7px] top-8 w-[1px] bg-gray-300 dark:bg-white/10" />
          <SectionTitle icon="psychology" title={t('support.faq.challenges.title')} />
          <View className="pl-1">
            <FAQItem
              question={t('support.faq.challenges.difficult.question')}
              answer={t('support.faq.challenges.difficult.answer')}
            />
            <FAQItem
              question={t('support.faq.challenges.screenLock.question')}
              answer={t('support.faq.challenges.screenLock.answer')}
            />
          </View>
        </View>

        {/* Section 4: Performance Summary */}
        <View className="relative mb-12">
          <View className="absolute bottom-4 left-[7px] top-8 w-[1px] bg-gray-300 dark:bg-white/10" />
          <SectionTitle icon="trending_up" title={t('support.faq.performance.title')} />
          <View className="pl-1">
            <FAQItem
              question={t('support.faq.performance.cognitiveScore.question')}
              answer={t('support.faq.performance.cognitiveScore.answer')}
            />
            <FAQItem
              question={t('support.faq.performance.streak.question')}
              answer={t('support.faq.performance.streak.answer')}
            />
            <FAQItem
              question={t('support.faq.performance.data.question')}
              answer={t('support.faq.performance.data.answer')}
            />
          </View>
        </View>

        {/* Section 5: Problemas Técnicos */}
        <View className="relative mb-12">
          <View className="absolute bottom-4 left-[7px] top-8 w-[1px] bg-gray-300 dark:bg-white/10" />
          <SectionTitle icon="bug_report" title={t('support.faq.technical.title')} />
          <View className="pl-1">
            <FAQItem
              question={t('support.faq.technical.crashing.question')}
              answer={t('support.faq.technical.crashing.answer')}
            />
            <FAQItem
              question={t('support.faq.technical.battery.question')}
              answer={t('support.faq.technical.battery.answer')}
            />
          </View>
        </View>

        {/* Contact Card */}
        {/* <View className="relative mb-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm dark:border-primary-500/40 dark:bg-primary-500/5">
          <View className="absolute left-0 right-0 top-0 hidden h-[1px] bg-primary-500/40 dark:flex" />
          <View className="absolute bottom-0 left-0 right-0 hidden h-[1px] bg-primary-500/40 dark:flex" />

          <View className="relative border-l-4 border-primary-500 p-6 dark:border-l-2">
            <View className="mb-4 flex-row items-center gap-3">
              <MaterialSymbol name="mail" size={24} color={COLORS.brandPrimary} />
              <Text className="text-xl font-bold tracking-tight text-slate-800 dark:text-primary-500">
                {t('support.contact.title')}
              </Text>
            </View>

            <Text className="mb-5 text-[15px] leading-relaxed text-gray-700 dark:text-gray-200">
              {t('support.contact.description')}
            </Text>

            <Pressable
              onPress={handleEmailSupport}
              className="flex-row items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3"
              accessibilityRole="button"
            >
              <MaterialSymbol name="send" size={18} color={COLORS.white} />
              <Text className="text-center text-base font-semibold text-white">
                {t('support.contact.emailButton')}
              </Text>
            </Pressable>
          </View>
        </View> */}

        {/* Footer */}
        <View className="items-center border-t border-gray-200 pt-8 dark:border-white/5">
          <View className="text-gray-300 dark:text-white">
            <MaterialSymbol name="support_agent" size={32} color={COLORS.gray[400]} />
          </View>
          <Text className="mb-3 mt-4 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            {t('support.footer')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
