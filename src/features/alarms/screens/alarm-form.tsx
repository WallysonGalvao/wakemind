import React, { useCallback, useLayoutEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useNavigation, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { BackupProtocolsSection } from '../components/backup-protocols-section';
import { CognitiveActivationSection } from '../components/cognitive-activation-section';
import { DifficultySelector } from '../components/difficulty-selector';
import { DayOfWeek, ScheduleSelector } from '../components/schedule-selector';
import { TimePickerWheel } from '../components/time-picker-wheel';
import type { AlarmFormData } from '../schemas/alarm-form.schema';
import { alarmFormSchema, getDefaultAlarmFormValues } from '../schemas/alarm-form.schema';

import { AnalyticsEvents } from '@/analytics';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { useAlarmPermissions } from '@/hooks/use-alarm-permissions';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useCustomShadow } from '@/hooks/use-shadow-style';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import type { BackupProtocolId } from '@/types/alarm-enums';
import { ChallengeType, Period } from '@/types/alarm-enums';

const BRAND_PRIMARY_SHADOW = 'rgba(19, 91, 236, 0.3)';

const CHALLENGE_ICONS: Record<ChallengeType, string> = {
  [ChallengeType.MATH]: 'calculate',
  [ChallengeType.MEMORY]: 'psychology',
  [ChallengeType.LOGIC]: 'lightbulb',
};

// Helper function to get current day of week
const getCurrentDayOfWeek = (): DayOfWeek => {
  const dayIndex = dayjs().day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  return dayMap[dayIndex];
};

// Day abbreviations for schedule label
const DAY_ABBREV: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Mon',
  [DayOfWeek.TUESDAY]: 'Tue',
  [DayOfWeek.WEDNESDAY]: 'Wed',
  [DayOfWeek.THURSDAY]: 'Thu',
  [DayOfWeek.FRIDAY]: 'Fri',
  [DayOfWeek.SATURDAY]: 'Sat',
  [DayOfWeek.SUNDAY]: 'Sun',
};

// Helper function to generate schedule label from selected days
const getScheduleLabel = (days: DayOfWeek[]): string => {
  const allDays = Object.values(DayOfWeek);
  const weekdays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];
  const weekends = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

  // Check if all days selected
  if (days.length === 7) {
    return 'Daily';
  }

  // Check if weekdays only
  if (
    days.length === 5 &&
    weekdays.every((d) => days.includes(d)) &&
    !weekends.some((d) => days.includes(d))
  ) {
    return 'Weekdays';
  }

  // Check if weekends only
  if (
    days.length === 2 &&
    weekends.every((d) => days.includes(d)) &&
    !weekdays.some((d) => days.includes(d))
  ) {
    return 'Weekends';
  }

  // Single day
  if (days.length === 1) {
    return DAY_ABBREV[days[0]];
  }

  // Custom: list of day abbreviations
  const sortedDays = [...days].sort((a, b) => {
    const order = allDays;
    return order.indexOf(a) - order.indexOf(b);
  });
  return sortedDays.map((d) => DAY_ABBREV[d]).join(', ');
};

// Map of day abbreviations back to DayOfWeek (reverse of DAY_ABBREV)
const ABBREV_TO_DAY: Record<string, DayOfWeek> = {
  Mon: DayOfWeek.MONDAY,
  Tue: DayOfWeek.TUESDAY,
  Wed: DayOfWeek.WEDNESDAY,
  Thu: DayOfWeek.THURSDAY,
  Fri: DayOfWeek.FRIDAY,
  Sat: DayOfWeek.SATURDAY,
  Sun: DayOfWeek.SUNDAY,
};

// Helper function to parse schedule label back to DayOfWeek array
const parseScheduleToDays = (schedule: string): DayOfWeek[] => {
  const allDays = Object.values(DayOfWeek);
  const weekdays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];
  const weekends = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

  // Handle preset values
  if (schedule === 'Daily') {
    return allDays;
  }
  if (schedule === 'Weekdays') {
    return weekdays;
  }
  if (schedule === 'Weekends') {
    return weekends;
  }

  // Handle single day abbreviation
  if (ABBREV_TO_DAY[schedule]) {
    return [ABBREV_TO_DAY[schedule]];
  }

  // Handle custom: comma-separated day abbreviations
  const abbreviations = schedule.split(',').map((s) => s.trim());
  const days: DayOfWeek[] = [];
  for (const abbr of abbreviations) {
    if (ABBREV_TO_DAY[abbr]) {
      days.push(ABBREV_TO_DAY[abbr]);
    }
  }

  // If parsing failed, return current day as fallback
  return days.length > 0 ? days : [getCurrentDayOfWeek()];
};

interface AlarmFormScreenProps {
  alarmId?: string; // Optional: if provided, we're in edit mode
}

export default function AlarmFormScreen({ alarmId }: AlarmFormScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  // Permissions hook
  const {
    isAllGranted,
    needsNotificationPermission,
    needsExactAlarmPermission,
    requestNotificationPermission,
    openBatterySettings,
    openAlarmSettings,
  } = useAlarmPermissions();

  // Store actions
  const addAlarm = useAlarmsStore((state) => state.addAlarm);
  const updateAlarm = useAlarmsStore((state) => state.updateAlarm);
  const deleteAlarm = useAlarmsStore((state) => state.deleteAlarm);
  const alarms = useAlarmsStore((state) => state.alarms);

  // Determine mode
  const isEditMode = Boolean(alarmId);

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

  // Get default values based on mode
  const defaultValues = useMemo((): AlarmFormData => {
    if (isEditMode && alarmId) {
      const existingAlarm = alarms.find((a) => a.id === alarmId);
      if (existingAlarm) {
        // Parse time string "HH:MM" - already in 24h format
        const [hourStr, minuteStr] = existingAlarm.time.split(':');

        const defaultVals = getDefaultAlarmFormValues();
        return {
          hour: parseInt(hourStr, 10),
          minute: parseInt(minuteStr, 10),
          selectedDays: parseScheduleToDays(existingAlarm.schedule),
          // Use challengeType directly if available, otherwise fall back to icon-based detection
          challenge:
            existingAlarm.challengeType ??
            ((Object.keys(CHALLENGE_ICONS).find(
              (key) => CHALLENGE_ICONS[key as ChallengeType] === existingAlarm.challengeIcon
            ) as ChallengeType) ||
              ChallengeType.MATH),
          difficulty: existingAlarm.difficulty ?? defaultVals.difficulty,
          protocols: existingAlarm.protocols ?? defaultVals.protocols,
        };
      }
    }
    return {
      ...getDefaultAlarmFormValues(),
      selectedDays: [getCurrentDayOfWeek()],
    };
  }, [alarmId, isEditMode, alarms]);

  // React Hook Form setup
  const { setValue, watch, reset, handleSubmit } = useForm<AlarmFormData>({
    resolver: zodResolver(alarmFormSchema),
    defaultValues,
  });

  // Watch all form values
  const hour = watch('hour');
  const minute = watch('minute');
  const selectedDays = watch('selectedDays');
  const challenge = watch('challenge');
  const difficulty = watch('difficulty');
  const protocols = watch('protocols');

  // Auto-determine period based on hour (0-11 = AM, 12-23 = PM)
  const period = hour < 12 ? Period.AM : Period.PM;

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleReset = useCallback(() => {
    reset({
      ...getDefaultAlarmFormValues(),
      selectedDays: [getCurrentDayOfWeek()],
    });
  }, [reset]);

  const handleDelete = useCallback(() => {
    if (alarmId) {
      AnalyticsEvents.alarmDeleted(alarmId);
      deleteAlarm(alarmId);
      router.back();
    }
  }, [alarmId, deleteAlarm, router]);

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

  const onSubmit = async (data: AlarmFormData) => {
    // Validate hour and minute are valid numbers
    if (
      typeof data.hour !== 'number' ||
      typeof data.minute !== 'number' ||
      isNaN(data.hour) ||
      isNaN(data.minute) ||
      data.hour < 0 ||
      data.hour > 23 ||
      data.minute < 0 ||
      data.minute > 59
    ) {
      toast.show({
        placement: 'top',
        duration: 4000,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>{t('newAlarm.validationError.title')}</ToastTitle>
            <ToastDescription>{t('validation.alarm.timeFormat')}</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    // Store time in 24h format
    const timeString = `${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`;
    const displayPeriod = data.hour < 12 ? Period.AM : Period.PM;
    const challengeIcon = CHALLENGE_ICONS[data.challenge];
    const challengeLabel = t(`newAlarm.challenges.${data.challenge}.title`);
    const scheduleLabel = getScheduleLabel(data.selectedDays);

    try {
      // Check permissions before creating/updating alarm
      if (!isAllGranted) {
        // Request notification permission first
        if (needsNotificationPermission) {
          const granted = await requestNotificationPermission();

          if (!granted) {
            toast.show({
              placement: 'top',
              duration: 4000,
              render: ({ id }) => (
                <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
                  <ToastTitle>{t('permissions.notificationsRequired')}</ToastTitle>
                  <ToastDescription>{t('permissions.openSettings')}</ToastDescription>
                </Toast>
              ),
            });
            return;
          }
        }

        // Check for exact alarm permission (Android 12+)
        if (needsExactAlarmPermission) {
          toast.show({
            placement: 'top',
            duration: 5000,
            render: ({ id }) => (
              <Toast nativeID={`toast-${id}`} action="info" variant="solid">
                <ToastTitle>{t('permissions.exactAlarmsRequired')}</ToastTitle>
                <ToastDescription>{t('permissions.batteryOptimization')}</ToastDescription>
              </Toast>
            ),
          });

          // Open both battery optimization and alarm settings
          // Battery optimization affects alarm reliability
          await openBatterySettings();
          // Exact alarm permission is required on Android 12+
          await openAlarmSettings();

          // After settings, user needs to manually create alarm again
          // We don't auto-continue here as they need to go through system settings
          return;
        }
      }

      // All permissions granted, proceed with alarm creation/update
      if (isEditMode && alarmId) {
        updateAlarm(alarmId, {
          time: timeString,
          period: displayPeriod,
          challenge: challengeLabel,
          challengeType: data.challenge,
          challengeIcon,
          schedule: scheduleLabel,
          difficulty: data.difficulty,
          protocols: data.protocols,
        });
        AnalyticsEvents.alarmUpdated(alarmId);
      } else {
        const newAlarmInput = {
          time: timeString,
          period: displayPeriod,
          challenge: challengeLabel,
          challengeType: data.challenge,
          challengeIcon,
          schedule: scheduleLabel,
          difficulty: data.difficulty,
          protocols: data.protocols,
        };
        addAlarm(newAlarmInput);
        // Track creation (ID will be generated, so we track with available info)
        AnalyticsEvents.alarmCreated('new-alarm', timeString, data.challenge);
      }

      router.back();
    } catch (error) {
      const title =
        error instanceof Error ? t('newAlarm.validationError.title') : t('newAlarm.error.title');
      const description = error instanceof Error ? error.message : t('newAlarm.error.message');

      toast.show({
        placement: 'top',
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>{title}</ToastTitle>
            <ToastDescription>{description}</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  // Format time for display (24h format with period indicator)
  const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

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

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingTop: isEditMode ? 0 : insets.top }}
    >
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
          className="h-14 w-full flex-row items-center justify-center rounded-xl bg-brand-primary active:scale-[0.98]"
          style={ctaShadow}
          accessibilityRole="button"
        >
          <Text className="mr-2 text-lg font-bold text-white">{commitButtonText}</Text>
          <MaterialSymbol name="arrow_forward" size={24} className="text-white" />
        </Pressable>
      </View>
    </View>
  );
}
