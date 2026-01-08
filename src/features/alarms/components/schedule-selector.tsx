import React from 'react';

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import type { SegmentedControlItem } from '@/components/segmented-control';
import { SegmentedControl } from '@/components/segmented-control';

// Day of week enum for custom schedule
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

// Day order for sorting
const DAY_ORDER: Record<DayOfWeek, number> = {
  [DayOfWeek.MONDAY]: 0,
  [DayOfWeek.TUESDAY]: 1,
  [DayOfWeek.WEDNESDAY]: 2,
  [DayOfWeek.THURSDAY]: 3,
  [DayOfWeek.FRIDAY]: 4,
  [DayOfWeek.SATURDAY]: 5,
  [DayOfWeek.SUNDAY]: 6,
};

interface ScheduleSelectorProps {
  selectedDays: DayOfWeek[];
  onDaysChange: (days: DayOfWeek[]) => void;
}

export function ScheduleSelector({ selectedDays, onDaysChange }: ScheduleSelectorProps) {
  const { t } = useTranslation();

  const dayItems: SegmentedControlItem<DayOfWeek>[] = [
    { value: DayOfWeek.MONDAY, label: t('newAlarm.schedule.days.mon') },
    { value: DayOfWeek.TUESDAY, label: t('newAlarm.schedule.days.tue') },
    { value: DayOfWeek.WEDNESDAY, label: t('newAlarm.schedule.days.wed') },
    { value: DayOfWeek.THURSDAY, label: t('newAlarm.schedule.days.thu') },
    { value: DayOfWeek.FRIDAY, label: t('newAlarm.schedule.days.fri') },
    { value: DayOfWeek.SATURDAY, label: t('newAlarm.schedule.days.sat') },
    { value: DayOfWeek.SUNDAY, label: t('newAlarm.schedule.days.sun') },
  ];

  // Handle day toggle for multi-select
  const handleDayToggle = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      // Prevent deselecting if it's the last selected day
      if (selectedDays.length === 1) {
        return;
      }
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day].sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]));
    }
  };

  return (
    <View className="mb-2 mt-[-12px]">
      {/* Schedule Type Selector */}
      <SegmentedControl
        title={t('newAlarm.schedule.label')}
        items={dayItems}
        selectedValue={selectedDays[0] ?? DayOfWeek.MONDAY}
        onValueChange={handleDayToggle}
        multiSelect
        selectedValues={selectedDays}
      />
    </View>
  );
}
