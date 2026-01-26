import React, { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Animated, Easing, Modal, Pressable, View } from 'react-native';

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

// Animated pulse ring component
function PulseRing() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
      className="absolute -right-2 h-10 w-10 rounded-full bg-brand-primary/30"
    />
  );
}

export function AlarmPermissionsModal({
  visible,
  onClose,
  onComplete,
}: AlarmPermissionsModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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

  const renderIllustration = () => {
    const isAutoStart = currentStep === PermissionStep.BATTERY_OPTIMIZATION;
    const toggleLabel = isAutoStart
      ? t('permissions.alarmPermissions.illustration.autoStart')
      : t('permissions.alarmPermissions.illustration.displayOver');

    return (
      <View className="relative mt-8 flex-1 items-center justify-center">
        {/* Outer ring */}
        <View className="absolute h-64 w-64 rounded-full border border-brand-primary/20 bg-brand-primary/10" />

        {/* Blur effect */}
        <View className="absolute h-48 w-48 rounded-full bg-brand-primary/5" />

        {/* Settings card */}
        <View className="z-10 w-56 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-surface-dark">
          {/* Skeleton header */}
          <View className="mb-4 flex-row items-center justify-between opacity-40">
            <View className="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-600" />
            <View className="h-2 w-8 rounded-full bg-slate-200 dark:bg-slate-600" />
          </View>

          {/* Toggle row */}
          <View className="flex-row items-center justify-between border-y border-slate-100 py-3 dark:border-slate-700">
            <Text className="text-sm font-bold text-slate-900 dark:text-white">{toggleLabel}</Text>
            <View className="relative">
              <View className="h-6 w-12 flex-row items-center rounded-full bg-brand-primary px-1">
                <View className="absolute right-1 h-4 w-4 rounded-full bg-white shadow-lg" />
              </View>
              <PulseRing />
            </View>
          </View>

          {/* Skeleton content */}
          <View className="mt-4 gap-2 opacity-40">
            <View className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600" />
            <View className="h-2 w-3/4 rounded-full bg-slate-200 dark:bg-slate-600" />
          </View>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    const isAutoStart = currentStep === PermissionStep.BATTERY_OPTIMIZATION;
    const stepNumber = isAutoStart ? 2 : 1;
    const titleKey = isAutoStart
      ? 'permissions.alarmPermissions.batteryOptimization.title'
      : 'permissions.alarmPermissions.systemAlertWindow.title';
    const descriptionKey = isAutoStart
      ? 'permissions.alarmPermissions.batteryOptimization.description'
      : 'permissions.alarmPermissions.systemAlertWindow.description';

    return (
      <View className="flex-1">
        {/* Progress label */}
        <View className="items-center">
          <Text className="font-mono mb-6 text-[11px] uppercase tracking-[0.2em] text-brand-primary">
            {t('permissions.alarmPermissions.progress', { current: stepNumber, total: 2 })}
          </Text>
        </View>

        {/* Title */}
        <Text className="mb-4 text-center text-2xl font-extrabold uppercase leading-tight tracking-tight text-slate-900 dark:text-white">
          {t(titleKey)}
        </Text>

        {/* Description */}
        <Text className="mx-auto max-w-[280px] text-center text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          {t(descriptionKey)}
        </Text>

        {/* Illustration */}
        {renderIllustration()}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View
        className="flex-1 bg-background-light dark:bg-background-dark"
        style={{ paddingTop: insets.top }}
      >
        {/* Close Button */}
        <View className="flex-row justify-end px-6 pt-4">
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.alarmPermissions.accessibility.close')}
            accessibilityHint={t('permissions.alarmPermissions.accessibility.closeHint')}
            className="h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-surface-dark"
          >
            <MaterialSymbol name="close" size={20} className="text-slate-600 dark:text-slate-300" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 px-8 pt-6">{renderStepContent()}</View>

        {/* Buttons */}
        <View className="px-8 pb-12">
          <Pressable
            onPress={handleNext}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.alarmPermissions.accessibility.nextHint')}
            accessibilityHint={t('permissions.alarmPermissions.accessibility.nextHint')}
            className="h-14 items-center justify-center rounded-xl bg-brand-primary shadow-lg active:scale-[0.98]"
          >
            <Text className="text-sm font-extrabold uppercase tracking-wider text-white">
              {isLoading
                ? t('permissions.alarmPermissions.accessibility.loading')
                : t('permissions.alarmPermissions.buttons.openSettings')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.alarmPermissions.accessibility.skipLabel')}
            accessibilityHint={t('permissions.alarmPermissions.accessibility.skipHint')}
            className="mt-4 items-center justify-center"
          >
            <Text className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t('permissions.alarmPermissions.buttons.skipForNow')}
            </Text>
          </Pressable>
        </View>

        {/* Bottom indicator */}
        <View className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <View className="bg-off-white h-1.5 w-32 rounded-full" />
        </View>
      </View>
    </Modal>
  );
}
