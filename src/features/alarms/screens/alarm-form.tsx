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
import { alarmFormSchema, DEFAULT_ALARM_FORM_VALUES } from '../schemas/alarm-form.schema';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { useCustomShadow } from '@/hooks/use-shadow-style';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import type { BackupProtocolId, Period } from '@/types/alarm-enums';
import { ChallengeType } from '@/types/alarm-enums';

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

interface AlarmFormScreenProps {
  alarmId?: string; // Optional: if provided, we're in edit mode
}

export default function AlarmFormScreen({ alarmId }: AlarmFormScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  // Store actions
  const addAlarm = useAlarmsStore((state) => state.addAlarm);
  const updateAlarm = useAlarmsStore((state) => state.updateAlarm);
  const alarms = useAlarmsStore((state) => state.alarms);

  // Determine mode
  const isEditMode = Boolean(alarmId);

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
        // Parse time string "HH:MM" to hour and minute
        const [hourStr, minuteStr] = existingAlarm.time.split(':');
        return {
          hour: parseInt(hourStr, 10),
          minute: parseInt(minuteStr, 10),
          period: existingAlarm.period,
          selectedDays: [getCurrentDayOfWeek()], // TODO: Parse from alarm schedule once available
          challenge:
            (Object.keys(CHALLENGE_ICONS).find(
              (key) => CHALLENGE_ICONS[key as ChallengeType] === existingAlarm.challengeIcon
            ) as ChallengeType) || ChallengeType.MATH,
          difficulty: existingAlarm.difficulty ?? DEFAULT_ALARM_FORM_VALUES.difficulty,
          protocols: existingAlarm.protocols ?? DEFAULT_ALARM_FORM_VALUES.protocols,
        };
      }
    }
    return {
      ...DEFAULT_ALARM_FORM_VALUES,
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
  const period = watch('period');
  const selectedDays = watch('selectedDays');
  const challenge = watch('challenge');
  const difficulty = watch('difficulty');
  const protocols = watch('protocols');

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleReset = useCallback(() => {
    reset({
      ...DEFAULT_ALARM_FORM_VALUES,
      selectedDays: [getCurrentDayOfWeek()],
    });
  }, [reset]);

  const handleTimeChange = (newHour: number, newMinute: number, newPeriod: Period) => {
    setValue('hour', newHour);
    setValue('minute', newMinute);
    setValue('period', newPeriod);
  };

  const handleProtocolToggle = (id: BackupProtocolId) => {
    const updatedProtocols = protocols.map((protocol) =>
      protocol.id === id ? { ...protocol, enabled: !protocol.enabled } : protocol
    );
    setValue('protocols', updatedProtocols);
  };

  const onSubmit = (data: AlarmFormData) => {
    const timeString = `${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`;
    const challengeIcon = CHALLENGE_ICONS[data.challenge];
    const challengeLabel = t(`newAlarm.challenges.${data.challenge}.title`);
    const scheduleLabel = getScheduleLabel(data.selectedDays);

    try {
      if (isEditMode && alarmId) {
        updateAlarm(alarmId, {
          time: timeString,
          period: data.period,
          challenge: challengeLabel,
          challengeIcon,
          schedule: scheduleLabel,
          difficulty: data.difficulty,
          protocols: data.protocols,
        });
      } else {
        addAlarm({
          time: timeString,
          period: data.period,
          challenge: challengeLabel,
          challengeIcon,
          schedule: scheduleLabel,
          difficulty: data.difficulty,
          protocols: data.protocols,
        });
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

  const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

  // Dynamic texts based on mode
  const screenTitle = isEditMode ? t('editAlarm.title') : t('newAlarm.title');
  const commitButtonText = isEditMode
    ? t('editAlarm.save')
    : t('newAlarm.commit', { time: formattedTime });

  // Header icons based on mode
  const leftIcon = isEditMode ? 'arrow_back' : 'close';
  const leftIconLabel = isEditMode ? t('common.back') : t('common.close');

  const navigation = useNavigation();

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
        <TimePickerWheel
          hour={hour}
          minute={minute}
          period={period}
          onTimeChange={handleTimeChange}
        />

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
