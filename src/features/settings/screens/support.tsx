import React, { useLayoutEffect } from 'react';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Linking, Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

export default function SupportScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const router = useRouter();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@wakemind.app?subject=WakeMind Support');
  };

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
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ Header */}
        <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          {t('support.faq.title')}
        </Text>

        {/* Alarmes e Notificações */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
            ⏰ {t('support.faq.alarms.title')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.alarms.notRinging.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.alarms.notRinging.answer')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.alarms.locked.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.alarms.locked.answer')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.alarms.snooze.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.alarms.snooze.answer')}
          </Text>
        </View>

        {/* Som e Vibração */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
            🔊 {t('support.faq.sound.title')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.sound.noVibration.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.sound.noVibration.answer')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.sound.testTones.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.sound.testTones.answer')}
          </Text>
        </View>

        {/* Desafios Cognitivos */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
            🧠 {t('support.faq.challenges.title')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.challenges.difficult.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.challenges.difficult.answer')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.challenges.screenLock.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.challenges.screenLock.answer')}
          </Text>
        </View>

        {/* Problemas Técnicos */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
            📱 {t('support.faq.technical.title')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.technical.crashing.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.technical.crashing.answer')}
          </Text>

          <Text className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('support.faq.technical.battery.question')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.faq.technical.battery.answer')}
          </Text>
        </View>

        {/* Contato */}
        <View className="mb-6 mt-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            {t('support.contact.title')}
          </Text>
          <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
            {t('support.contact.description')}
          </Text>
          <Pressable
            onPress={handleEmailSupport}
            className="rounded-lg bg-blue-500 px-4 py-3"
            accessibilityRole="button"
          >
            <Text className="text-center text-base font-semibold text-white">
              {t('support.contact.emailButton')}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="mt-4 items-center">
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t('support.footer')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
