import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { randomUUID } from 'expo-crypto';
import { useNavigation, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Platform, Pressable, ScrollView, View } from 'react-native';

import { BackupProtocolsSection } from '../components/backup-protocols-section';
import { CognitiveActivationSection } from '../components/cognitive-activation-section';
import { DifficultySelector } from '../components/difficulty-selector';
import { ScheduleSelector } from '../components/schedule-selector';
import { TimePickerWheel } from '../components/time-picker-wheel';
import { BRAND_PRIMARY_SHADOW, CHALLENGE_ICONS } from '../constants/alarm-constants';
import type { AlarmFormData } from '../schemas/alarm-form.schema';
import { alarmFormSchema, getDefaultAlarmFormValues } from '../schemas/alarm-form.schema';
import {
  getCurrentDayOfWeek,
  getScheduleLabel,
  parseScheduleToDays,
} from '../utils/schedule-utils';
import {
  formatTime12h,
  formatTime24h,
  getPeriodFromHour,
  parseTimeString,
} from '../utils/time-utils';
import { validateAlarmSubmission } from '../validators/alarm-validators';

import { AnalyticsEvents } from '@/analytics';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { AlarmPermissionsModal } from '@/components/permissions/alarm-permissions-modal';
import { Text } from '@/components/ui/text';
import * as alarmsDb from '@/db/functions/alarms';
import { useAlarmPermissions } from '@/hooks/use-alarm-permissions';
import { useAlarms } from '@/hooks/use-alarms';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useCustomShadow } from '@/hooks/use-shadow-style';
import { useToastNotification } from '@/hooks/use-toast-notification';
import { type BackupProtocolId, DifficultyLevel } from '@/types/alarm-enums';

interface AlarmFormScreenProps {
  alarmId?: string; // Optional: if provided, we're in edit mode
}

export default function AlarmFormScreen({ alarmId }: AlarmFormScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  const toast = useToastNotification();
  const isMounted = useIsMounted();
  const insets = useSafeAreaInsets();

  // Permissions modal state
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [pendingAlarmData, setPendingAlarmData] = useState<AlarmFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permissions hook
  const {
    status,
    needsNotificationPermission,
    needsExactAlarmPermission,
    checkPermissions,
    requestNotificationPermission,
    openAlarmSettings,
  } = useAlarmPermissions();

  // Get alarms from hook
  const { alarms, refetch } = useAlarms();

  // Feature access for premium limits
  const { canCreateAlarm, canUseDifficulty, requirePremiumAccess } = useFeatureAccess();

  // Determine mode
  const isEditMode = Boolean(alarmId);

  // Check if this is the first alarm
  const isFirstAlarm = !isEditMode && alarms.length === 0;

  // Analytics tracking
  useAnalyticsScreen(isEditMode ? 'Edit Alarm' : 'Create Alarm');

  // CTA shadow style
  const ctaShadow = useCustomShadow({
    offset: { width: 0, height: 4 },
    opacity: 1,
    radius: 14,
    elevation: 4,
    color: BRAND_PRIMARY_SHADOW,
  });

  // Get the specific alarm if in edit mode (optimized memo)
  const currentAlarm = useMemo(
    () => (isEditMode && alarmId ? alarms.find((a) => a.id === alarmId) : undefined),
    [alarms, alarmId, isEditMode]
  );

  const defaultValues = useMemo((): AlarmFormData => {
    if (isEditMode && currentAlarm) {
      console.log('currentAlarm:: ' + JSON.stringify(currentAlarm));
      const parsedTime = parseTimeString(currentAlarm.time);
      const parsedDays = parseScheduleToDays(currentAlarm.schedule);

      return {
        hour: parsedTime?.hour || 0,
        minute: parsedTime?.minute || 0,
        selectedDays: parsedDays,
        challenge: currentAlarm.challengeType,
        difficulty: currentAlarm.difficulty ?? DifficultyLevel.EASY,
        protocols: currentAlarm.protocols ?? getDefaultAlarmFormValues().protocols,
      };
    }
    return {
      ...getDefaultAlarmFormValues(),
      selectedDays: [getCurrentDayOfWeek()],
    };
  }, [currentAlarm, isEditMode]);

  const { setValue, control, reset, handleSubmit } = useForm<AlarmFormData>({
    resolver: zodResolver(alarmFormSchema),
    values: defaultValues,
  });

  // Optimized watch using useWatch (reduces re-renders)
  const formValues = useWatch({
    control,
    name: ['hour', 'minute', 'selectedDays', 'challenge', 'difficulty', 'protocols'],
  });

  const [hour, minute, selectedDays, challenge, difficulty, protocols] = formValues;

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleReset = useCallback(() => {
    reset({
      ...getDefaultAlarmFormValues(),
      selectedDays: [getCurrentDayOfWeek()],
    });
  }, [reset]);

  // Cleanup pendingAlarmData on unmount
  useEffect(() => {
    return () => {
      setPendingAlarmData(null);
    };
  }, []);

  const handleDelete = useCallback(async () => {
    if (alarmId) {
      AnalyticsEvents.alarmDeleted(alarmId);
      await alarmsDb.deleteAlarm(alarmId);
      await refetch();
      // Only navigate if component is still mounted
      if (isMounted()) {
        router.back();
      }
    }
  }, [alarmId, refetch, router, isMounted]);

  const handleTimeChange = (newHour: number, newMinute: number) => {
    setValue('hour', newHour);
    setValue('minute', newMinute);
  };

  const handleProtocolToggle = (id: BackupProtocolId) => {
    const updatedProtocols = protocols.map((protocol) =>
      protocol.id === id ? { ...protocol, enabled: !protocol.enabled } : protocol
    );
    setValue('protocols', updatedProtocols);
  };

  // Handle permission modal close (cleanup pending data)
  const handlePermissionsModalClose = useCallback(() => {
    setShowPermissionsModal(false);
    setPendingAlarmData(null);
  }, []);

  // Handle permission modal completion
  const handlePermissionsComplete = useCallback(async () => {
    setShowPermissionsModal(false);

    // Recheck permissions after user goes through settings
    await checkPermissions();

    // If we have pending alarm data, try to create it now
    if (pendingAlarmData) {
      await createAlarm(pendingAlarmData);
      setPendingAlarmData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkPermissions, pendingAlarmData]);

  // Separated function to create/update alarm (called after all validations)
  const createAlarm = async (data: AlarmFormData) => {
    // Store time in 24h format using utility
    const timeString = formatTime24h(data.hour, data.minute);
    const displayPeriod = getPeriodFromHour(data.hour);
    const challengeIcon = CHALLENGE_ICONS[data.challenge];
    const challengeLabel = t(`newAlarm.challenges.${data.challenge}.title`);
    const scheduleLabel = getScheduleLabel(data.selectedDays);

    const alarmData = {
      time: timeString,
      period: displayPeriod,
      challenge: challengeLabel,
      challengeType: data.challenge,
      challengeIcon,
      schedule: scheduleLabel,
      difficulty: data.difficulty,
      protocols: data.protocols,
    };

    try {
      // Create or update alarm
      if (isEditMode && alarmId) {
        await alarmsDb.updateAlarm(alarmId, alarmData);
        await refetch();
        AnalyticsEvents.alarmUpdated(alarmId);
      } else {
        const newId = randomUUID();
        await alarmsDb.addAlarm(newId, alarmData);
        await refetch();
        AnalyticsEvents.alarmCreated(newId, timeString, data.challenge);
      }

      // Only navigate if component is still mounted
      if (isMounted()) {
        router.back();
      }
    } catch (error) {
      const title =
        error instanceof Error ? t('newAlarm.validationError.title') : t('newAlarm.error.title');
      const description = error instanceof Error ? error.message : t('newAlarm.error.message');

      toast.showError(title, description);
    }
  };

  const onSubmit = async (data: AlarmFormData) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1️⃣ Validate form data using centralized validators
      const validation = validateAlarmSubmission(data, {
        isEditMode,
        alarmsCount: alarms.length,
        canUseDifficulty,
        canCreateAlarm,
      });

      if (!validation.valid && validation.error) {
        // Handle validation errors based on type
        if (validation.error === 'validation.alarm.timeFormat') {
          toast.showError(t('newAlarm.validationError.title'), t(validation.error));
        } else if (validation.error === 'featureGate.hardDifficulty') {
          toast.showWarning(
            t('featureGate.hardDifficulty'),
            t('paywall.features.allDifficulties.description')
          );
          await requirePremiumAccess('difficulty_selection');
        } else if (validation.error === 'featureGate.unlimitedAlarms') {
          toast.showWarning(
            t('featureGate.unlimitedAlarms'),
            t('paywall.features.unlimitedAlarms.description')
          );
          await requirePremiumAccess('alarm_creation');
        } else {
          toast.showError(t('newAlarm.validationError.title'), t(validation.error));
        }
        return;
      }

      // 2️⃣ Request notification permission first (runtime permission)
      if (needsNotificationPermission) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          toast.showWarning(t('permissions.notificationsRequired'), t('permissions.openSettings'));
          return;
        }
      }

      // 3️⃣ Check exact alarm permission (Android 12+)
      if (needsExactAlarmPermission) {
        toast.showInfo(t('permissions.exactAlarmsRequired'), t('permissions.batteryOptimization'));
        await openAlarmSettings();
        return;
      }

      // 4️⃣ FIRST ALARM: Show permissions modal for SYSTEM_ALERT_WINDOW + Auto Start
      if (
        Platform.OS === 'android' &&
        isFirstAlarm &&
        (status.displayOverOtherApps !== 'granted' || status.autoStart === 'undetermined')
      ) {
        setPendingAlarmData(data);
        setShowPermissionsModal(true);
        return;
      }

      // 5️⃣ All validations passed - create the alarm
      await createAlarm(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time for display using utility (memoized)
  const formattedTime = useMemo(() => formatTime12h(hour, minute), [hour, minute]);

  // Dynamic texts based on mode
  const screenTitle = isEditMode ? t('editAlarm.title') : t('newAlarm.title');
  const commitButtonText = isEditMode
    ? t('editAlarm.save')
    : t('newAlarm.commit', { time: formattedTime });

  // Header icons based on mode
  const leftIcon = isEditMode ? 'arrow_back' : 'close';
  const leftIconLabel = isEditMode ? t('common.back') : t('common.close');

  useLayoutEffect(() => {
    if (isEditMode) {
      navigation.setOptions({
        headerTitle: screenTitle,
        headerLeft: () => (
          <Pressable accessibilityRole="button" onPress={handleClose} className="p-2">
            <MaterialSymbol
              name="arrow_back"
              size={24}
              className="text-slate-900 dark:text-white"
            />
          </Pressable>
        ),
      });
    }
  }, [isEditMode, navigation, screenTitle, handleClose, handleReset, t]);

  const paddingTop = isEditMode ? 0 : insets.top;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark" style={{ paddingTop }}>
      {/* Permissions Modal - Shows on first alarm creation for critical Android permissions */}
      {Platform.OS === 'android' && (
        <AlarmPermissionsModal
          visible={showPermissionsModal}
          onClose={handlePermissionsModalClose}
          onComplete={handlePermissionsComplete}
        />
      )}

      {/* Header */}
      {!isEditMode && (
        <Header
          title={screenTitle}
          leftIcons={[
            {
              icon: (
                <MaterialSymbol
                  name={leftIcon}
                  size={24}
                  className="text-slate-900 dark:text-white"
                />
              ),
              onPress: handleClose,
              accessibilityLabel: leftIconLabel,
            },
          ]}
          rightIcons={[
            {
              label: (
                <Text className="text-base font-medium text-slate-500 dark:text-slate-400">
                  {t('newAlarm.reset')}
                </Text>
              ),
              onPress: handleReset,
              accessibilityLabel: t('newAlarm.reset'),
            },
          ]}
        />
      )}

      {/* Content */}
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Time Picker Section */}
        <TimePickerWheel hour={hour} minute={minute} onTimeChange={handleTimeChange} />

        {/* Schedule Selector */}
        <ScheduleSelector
          selectedDays={selectedDays}
          onDaysChange={(days) => setValue('selectedDays', days)}
        />

        {/* Cognitive Activation Section */}
        <CognitiveActivationSection
          selectedChallenge={challenge}
          onChallengeSelect={(type) => setValue('challenge', type)}
        />

        {/* Difficulty Selector */}
        <DifficultySelector
          selectedDifficulty={difficulty}
          onDifficultyChange={(level) => setValue('difficulty', level)}
        />

        {/* Divider */}
        <View className="mx-4 my-4 h-px bg-slate-200 dark:bg-surface-highlight" />

        {/* Backup Protocols Section */}
        <BackupProtocolsSection protocols={protocols} onProtocolToggle={handleProtocolToggle} />

        {/* Delete Button - Only in Edit Mode */}
        {isEditMode ? (
          <Pressable
            onPress={handleDelete}
            className="mx-4 mt-3  h-14 flex-row items-center justify-center rounded-xl bg-red-500 active:scale-[0.98]"
            accessibilityRole="button"
          >
            <MaterialSymbol name="delete" size={20} className="mr-2 text-white" />
            <Text className="text-base font-semibold text-white">{t('common.delete')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 z-30 w-full bg-gradient-to-t from-background-light p-4 dark:from-background-dark"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="h-14 w-full flex-row items-center justify-center rounded-xl bg-brand-primary active:scale-[0.98] disabled:opacity-50"
          style={ctaShadow}
          accessibilityRole="button"
        >
          <Text className="mr-2 text-lg font-bold text-white">
            {isSubmitting ? t('common.saving') : commitButtonText}
          </Text>
          {!isSubmitting && (
            <MaterialSymbol name="arrow_forward" size={24} className="text-white" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
