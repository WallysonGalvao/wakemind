import React, { useCallback, useLayoutEffect } from 'react';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface ProtocolInfoCardProps {
  icon: string;
  iconClassName: string;
  iconBgColor: string;
  title: string;
  description: string;
}

function ProtocolInfoCard({
  icon,
  iconClassName,
  iconBgColor,
  title,
  description,
}: ProtocolInfoCardProps) {
  const shadowStyle = useShadowStyle('sm');

  return (
    <View
      className="flex-row gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark"
      style={shadowStyle}
    >
      <View className={`flex size-12 items-center justify-center rounded-full ${iconBgColor}`}>
        <MaterialSymbol name={icon} size={24} className={iconClassName} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
        <Text className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </Text>
      </View>
    </View>
  );
}

interface BenefitItemProps {
  text: string;
}

function BenefitItem({ text }: BenefitItemProps) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-green-500">
        <MaterialSymbol name="check" size={14} className="text-white" />
      </View>
      <Text className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{text}</Text>
    </View>
  );
}

export default function BackupProtocolsInfoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('newAlarm.backupProtocols.infoModal.title'),
      headerLeft: () => (
        <Pressable accessibilityRole="button" onPress={handleClose} className="p-2">
          <MaterialSymbol name="close" size={24} className="text-slate-900 dark:text-white" />
        </Pressable>
      ),
    });
  }, [navigation, t, handleClose]);

  return (
    <View className="flex-1 bg-background-light pt-4 dark:bg-background-dark">
      {/* Content */}
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        {/* Hero section with icon */}
        <View className="items-center px-4 pb-6 pt-4">
          <View className="mb-4 flex size-20 items-center justify-center rounded-full bg-brand-primary/10">
            <MaterialSymbol name="verified_user" size={40} className="text-brand-primary" />
          </View>
          <Text className="text-center text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {t('newAlarm.backupProtocols.infoModal.description')}
          </Text>
        </View>

        {/* Divider */}
        <View className="mx-4 h-px bg-slate-200 dark:bg-surface-highlight" />

        {/* Why section */}
        <View className="px-4 pb-6 pt-6">
          <Text className="mb-4 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {t('newAlarm.backupProtocols.infoModal.whyTitle')}
          </Text>
          <View className="flex-col gap-3">
            <BenefitItem text={t('newAlarm.backupProtocols.infoModal.benefit1')} />
            <BenefitItem text={t('newAlarm.backupProtocols.infoModal.benefit2')} />
            <BenefitItem text={t('newAlarm.backupProtocols.infoModal.benefit3')} />
          </View>
        </View>

        {/* Divider */}
        <View className="mx-4 h-px bg-slate-200 dark:bg-surface-highlight" />

        {/* Protocols section */}
        <View className="px-4 pb-6 pt-6">
          <Text className="mb-4 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {t('newAlarm.backupProtocols.infoModal.protocolsTitle')}
          </Text>

          <View className="flex-col gap-3">
            {/* Snooze */}
            <ProtocolInfoCard
              icon="snooze"
              iconClassName="text-red-500"
              iconBgColor="bg-red-500/10"
              title={t('newAlarm.backupProtocols.snooze.title')}
              description={t('newAlarm.backupProtocols.infoModal.snoozeDescription')}
            />

            {/* Wake Check */}
            <ProtocolInfoCard
              icon="check_circle"
              iconClassName="text-green-500"
              iconBgColor="bg-green-500/10"
              title={t('newAlarm.backupProtocols.wakeCheck.title')}
              description={t('newAlarm.backupProtocols.infoModal.wakeCheckDescription')}
            />

            {/* Barcode Scan */}
            <ProtocolInfoCard
              icon="qr_code_scanner"
              iconClassName="text-purple-500"
              iconBgColor="bg-purple-500/10"
              title={t('newAlarm.backupProtocols.barcodeScan.title')}
              description={t('newAlarm.backupProtocols.infoModal.barcodeScanDescription')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
