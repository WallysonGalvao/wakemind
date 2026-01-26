import React, { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppState, Modal, Pressable, View } from 'react-native';

import { MaterialSymbol } from '../material-symbol';
import { Text } from '../ui/text';

import { AnalyticsEvents } from '@/analytics';
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
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute -right-2 h-10 w-10 rounded-full bg-brand-primary/30"
    />
  );
}

// Animated ping dot component
function PingDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(2, { duration: 1000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="absolute right-10 top-0 h-2 w-2">
      <View className="h-2 w-2 rounded-full bg-brand-primary" />
      <Animated.View
        style={animatedStyle}
        className="absolute inset-0 rounded-full bg-brand-primary"
      />
    </View>
  );
}

export function AlarmPermissionsModal({
  visible,
  onClose,
  onComplete,
}: AlarmPermissionsModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { openDisplayOverOtherAppsSettings, openAutoStartSettings, status, checkPermissions } =
    useAlarmPermissions();

  const [currentStep, setCurrentStep] = useState<PermissionStep>(
    PermissionStep.SYSTEM_ALERT_WINDOW
  );
  const [isLoading, setIsLoading] = useState(false);
  const appState = useRef(AppState.currentState);
  const permissionBeforeSettings = useRef<string | null>(null);

  // Track modal shown
  useEffect(() => {
    if (visible) {
      AnalyticsEvents.permissionModalShown('first_alarm');
      AnalyticsEvents.permissionStepViewed('system_alert_window', 1);
    }
  }, [visible]);

  // Listen to app state to check permissions when user returns from settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        permissionBeforeSettings.current &&
        visible
      ) {
        // User returned to app, check if permission was granted
        await checkPermissions();

        const permission = permissionBeforeSettings.current;
        let wasGranted = false;

        if (permission === 'system_alert_window') {
          wasGranted = status.displayOverOtherApps === 'granted';
        } else if (permission === 'battery_optimization') {
          wasGranted = status.batteryOptimization === 'granted' || status.autoStart === 'granted';
        }

        if (!wasGranted) {
          AnalyticsEvents.permissionDenied(permission);
        }

        permissionBeforeSettings.current = null;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [visible, status, checkPermissions]);

  const handleNext = async () => {
    if (currentStep === PermissionStep.SYSTEM_ALERT_WINDOW) {
      setIsLoading(true);
      try {
        permissionBeforeSettings.current = 'system_alert_window';
        await openDisplayOverOtherAppsSettings();
        // Will check permission status when user returns (via AppState listener)
        setCurrentStep(PermissionStep.BATTERY_OPTIMIZATION);
        AnalyticsEvents.permissionStepViewed('battery_optimization', 2);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === PermissionStep.BATTERY_OPTIMIZATION) {
      setIsLoading(true);
      try {
        permissionBeforeSettings.current = 'battery_optimization';
        await openAutoStartSettings();
        // Will check permission status when user returns (via AppState listener)

        // Count granted permissions
        let grantedCount = 0;
        if (status.displayOverOtherApps === 'granted') grantedCount++;
        if (status.batteryOptimization === 'granted' || status.autoStart === 'granted')
          grantedCount++;

        AnalyticsEvents.permissionFlowCompleted(grantedCount, 2);
        onComplete();
        handleClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSkip = () => {
    const step =
      currentStep === PermissionStep.SYSTEM_ALERT_WINDOW
        ? 'system_alert_window'
        : 'battery_optimization';
    AnalyticsEvents.permissionSkipped(step);
    AnalyticsEvents.permissionFlowCompleted(0, 2);
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
      <View className="relative mt-12 w-full flex-1 items-center justify-center">
        {/* Outer ring */}
        <View className="absolute h-[280px] w-[280px] rounded-full border border-brand-primary/20 bg-brand-primary/10 dark:bg-brand-primary/5" />

        {/* Blur effect */}
        <View className="absolute h-[200px] w-[200px] rounded-full bg-brand-primary/5 blur-3xl" />

        {/* Settings card */}
        <View className="z-10 w-full max-w-[240px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/5 dark:bg-surface-dark">
          {/* Skeleton header */}
          <View className="mb-4 flex-row items-center justify-between opacity-40">
            <View className="h-2 w-16 rounded-full bg-slate-300 dark:bg-white/20" />
            <View className="h-2 w-8 rounded-full bg-slate-300 dark:bg-white/20" />
          </View>

          {/* Toggle row */}
          <View className="flex-row items-center justify-between border-y border-slate-100 py-3 dark:border-white/10">
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
            <View className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10" />
            <View className="h-2 w-3/4 rounded-full bg-slate-200 dark:bg-white/10" />
          </View>
        </View>

        {/* Animated ping dot */}
        {/* <PingDot /> */}

        {/* Status label */}
        <View className="absolute bottom-36 left-16">
          <Text className="font-mono rotate-90 text-[8px] uppercase tracking-widest text-brand-primary/50">
            {t('permissions.alarmPermissions.illustration.statusPending')}
          </Text>
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
          <View className="h-1.5 w-32 rounded-full bg-slate-300 dark:bg-white/20" />
        </View>
      </View>
    </Modal>
  );
}
