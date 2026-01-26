import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Modal, Pressable, View } from 'react-native';

import { MaterialSymbol } from '../material-symbol';
import { Text } from '../ui/text';

import { useAlarmPermissions } from '@/hooks/use-alarm-permissions';

interface AlarmPermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

enum PermissionStep {
  SYSTEM_ALERT_WINDOW = 'system_alert_window',
  BATTERY_OPTIMIZATION = 'battery_optimization',
}

export function AlarmPermissionsModal({
  visible,
  onClose,
  onComplete,
}: AlarmPermissionsModalProps) {
  const { t } = useTranslation();
  const { openDisplayOverOtherAppsSettings, openAutoStartSettings } = useAlarmPermissions();
  const [currentStep, setCurrentStep] = useState<PermissionStep>(
    PermissionStep.SYSTEM_ALERT_WINDOW
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (currentStep === PermissionStep.SYSTEM_ALERT_WINDOW) {
      setIsLoading(true);
      try {
        await openDisplayOverOtherAppsSettings();
        setCurrentStep(PermissionStep.BATTERY_OPTIMIZATION);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === PermissionStep.BATTERY_OPTIMIZATION) {
      setIsLoading(true);
      try {
        await openAutoStartSettings();
        onComplete();
        handleClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSkip = () => {
    onComplete();
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(PermissionStep.SYSTEM_ALERT_WINDOW);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case PermissionStep.SYSTEM_ALERT_WINDOW:
        return (
          <>
            <View className="mb-2 items-center">
              <Text className="text-electric-cyan mb-4 text-xs font-bold uppercase tracking-wider">
                {t('permissions.alarmPermissions.progress', { current: 1, total: 2 })}
              </Text>
              <View className="from-electric-cyan/20 to-electric-cyan/5 mb-4 h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br">
                <View className="shadow-subtle h-24 w-24 items-center justify-center rounded-full bg-white">
                  <MaterialSymbol name="open_in_new" size={56} className="text-electric-cyan" />
                </View>
              </View>
              <Text className="text-deep-blue mb-2 text-center text-xl font-bold">
                {t('permissions.alarmPermissions.systemAlertWindow.title')}
              </Text>
              <Text className="text-graphite-grey/70 px-4 text-center text-sm">
                {t('permissions.alarmPermissions.systemAlertWindow.description')}
              </Text>
            </View>

            <View className="border-electric-cyan/20 bg-insight-blue my-6 rounded-xl border p-4">
              <View className="mb-2 flex-row items-center">
                <MaterialSymbol name="info" size={18} className="text-electric-cyan mr-2" />
                <Text className="text-electric-cyan text-xs font-semibold uppercase tracking-wide">
                  {t('permissions.alarmPermissions.systemAlertWindow.benefitTitle')}
                </Text>
              </View>
              <Text className="text-graphite-grey text-xs">
                {t('permissions.alarmPermissions.systemAlertWindow.benefit')}
              </Text>
            </View>
          </>
        );

      case PermissionStep.BATTERY_OPTIMIZATION:
        return (
          <>
            <View className="mb-2 items-center">
              <Text className="text-electric-cyan mb-4 text-xs font-bold uppercase tracking-wider">
                {t('permissions.alarmPermissions.progress', { current: 2, total: 2 })}
              </Text>
              <View className="from-electric-cyan/20 to-electric-cyan/5 mb-4 h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br">
                <View className="shadow-subtle h-24 w-24 items-center justify-center rounded-full bg-white">
                  <MaterialSymbol
                    name="battery_charging_full"
                    size={56}
                    className="text-electric-cyan"
                  />
                </View>
              </View>
              <Text className="text-deep-blue mb-2 text-center text-xl font-bold">
                {t('permissions.alarmPermissions.batteryOptimization.title')}
              </Text>
              <Text className="text-graphite-grey/70 px-4 text-center text-sm">
                {t('permissions.alarmPermissions.batteryOptimization.description')}
              </Text>
            </View>

            <View className="border-electric-cyan/20 bg-insight-blue my-6 rounded-xl border p-4">
              <View className="mb-2 flex-row items-center">
                <MaterialSymbol name="check_circle" size={18} className="text-electric-cyan mr-2" />
                <Text className="text-electric-cyan text-xs font-semibold uppercase tracking-wide">
                  {t('permissions.alarmPermissions.batteryOptimization.benefitTitle')}
                </Text>
              </View>
              <Text className="text-graphite-grey text-xs">
                {t('permissions.alarmPermissions.batteryOptimization.benefit')}
              </Text>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  const getButtonText = () => {
    return t('permissions.alarmPermissions.buttons.openSettings');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 justify-end">
          <View className="rounded-t-3xl bg-white px-6 pb-8 pt-6">
            {/* Close Button */}
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={t('permissions.alarmPermissions.accessibility.close')}
              accessibilityHint={t('permissions.alarmPermissions.accessibility.closeHint')}
              className="hover:bg-off-white absolute right-4 top-4 z-10 h-10 w-10 items-center justify-center rounded-full"
            >
              <MaterialSymbol name="close" size={24} className="text-graphite-grey" />
            </Pressable>

            {/* Content */}
            <View className="mb-6 min-h-[400px]">{renderStepContent()}</View>

            {/* Buttons */}
            <View className="space-y-3">
              <Pressable
                onPress={handleNext}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={getButtonText()}
                accessibilityHint={t('permissions.alarmPermissions.accessibility.nextHint')}
                className="bg-electric-cyan shadow-hover h-14 items-center justify-center rounded-xl active:scale-[0.98]"
              >
                {isLoading ? (
                  <Text className="text-base font-bold text-white">
                    {t('permissions.alarmPermissions.accessibility.loading')}
                  </Text>
                ) : (
                  <Text className="text-base font-bold text-white">{getButtonText()}</Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel={t('permissions.alarmPermissions.accessibility.skipLabel')}
                accessibilityHint={t('permissions.alarmPermissions.accessibility.skipHint')}
                className="h-12 items-center justify-center rounded-xl"
              >
                <Text className="text-graphite-grey text-sm font-medium">
                  {t('permissions.alarmPermissions.buttons.skipForNow')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
