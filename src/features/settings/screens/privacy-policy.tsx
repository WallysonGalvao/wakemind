import React, { useLayoutEffect } from 'react';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

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

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {t('privacyPolicy.lastUpdated')}
        </Text>

        {/* Introdução */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.introduction.title')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          {t('privacyPolicy.introduction.content')}
        </Text>

        {/* Dados que Coletamos */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.dataCollected.title')}
        </Text>

        <Text className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
          {t('privacyPolicy.dataCollected.localData.title')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.localData.alarms')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.localData.preferences')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.localData.performance')}
        </Text>
        <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.localData.settings')}
        </Text>

        <Text className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
          {t('privacyPolicy.dataCollected.notCollected.title')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.notCollected.personal')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.notCollected.location')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.notCollected.contacts')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.dataCollected.notCollected.analytics')}
        </Text>

        {/* Como Usamos Seus Dados */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.dataUsage.title')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          {t('privacyPolicy.dataUsage.content')}
        </Text>

        {/* Compartilhamento */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.dataSharing.title')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          {t('privacyPolicy.dataSharing.content')}
        </Text>

        {/* Segurança */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.security.title')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          {t('privacyPolicy.security.content')}
        </Text>

        {/* Seus Direitos */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.rights.title')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.rights.delete')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.rights.modify')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.rights.reset')}
        </Text>

        {/* Permissões */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.permissions.title')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.permissions.notifications')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.permissions.audio')}
        </Text>
        <Text className="mb-1 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.permissions.vibration')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          • {t('privacyPolicy.permissions.screen')}
        </Text>

        {/* Alterações */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.changes.title')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          {t('privacyPolicy.changes.content')}
        </Text>

        {/* Contato */}
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('privacyPolicy.contact.title')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-700 dark:text-gray-300">
          {t('privacyPolicy.contact.content')}
        </Text>
      </ScrollView>
    </View>
  );
}
