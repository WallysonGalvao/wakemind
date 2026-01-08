import React from 'react';

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { Alert } from 'react-native';

import NewAlarmScreen from '../new-alarm';

import { DayOfWeek } from '@/features/alarms/components/schedule-selector';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import { BackupProtocolId, ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';

// Mock expo-router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'newAlarm.title': 'New Alarm',
        'newAlarm.reset': 'Reset',
        'newAlarm.commit': `Set alarm for ${params?.time || '06:00 AM'}`,
        'common.close': 'Close',
        'common.ok': 'OK',
        'newAlarm.validationError.title': 'Validation Error',
        'newAlarm.error.title': 'Error',
        'newAlarm.error.message': 'An error occurred',
        'newAlarm.challenges.math.title': 'Math Challenge',
        'newAlarm.challenges.memory.title': 'Memory Challenge',
        'newAlarm.challenges.logic.title': 'Logic Challenge',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const mockDayjs = () => ({
    day: () => 1, // Monday
  });
  return mockDayjs;
});

// Mock custom hooks
jest.mock('@/hooks/use-shadow-style', () => ({
  useCustomShadow: () => ({}),
}));

// Mock child components
/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('@/features/alarms/components/time-picker-wheel', () => ({
  TimePickerWheel: ({ hour, minute, period, onTimeChange }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="time-picker-wheel">
        <Text testID="time-display">
          {hour}:{minute} {period}
        </Text>
        <Pressable
          accessibilityRole="button"
          testID="change-time-button"
          onPress={() => onTimeChange(7, 30, 'PM')}
        >
          <Text>Change Time</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/features/alarms/components/schedule-selector', () => ({
  ScheduleSelector: ({ selectedDays, onDaysChange }: any) => {
    const { View, Pressable, Text } = require('react-native');
    return (
      <View testID="schedule-selector">
        <Text testID="selected-days">{selectedDays.join(',')}</Text>
        <Pressable
          accessibilityRole="button"
          testID="change-days-button"
          onPress={() => onDaysChange(['tuesday'])}
        >
          <Text>Change Days</Text>
        </Pressable>
      </View>
    );
  },
  DayOfWeek: {
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday',
    SATURDAY: 'saturday',
    SUNDAY: 'sunday',
  },
}));

jest.mock('@/features/alarms/components/cognitive-activation-section', () => ({
  CognitiveActivationSection: ({ selectedChallenge, onChallengeSelect }: any) => {
    const { View, Pressable, Text } = require('react-native');
    return (
      <View testID="cognitive-activation-section">
        <Text testID="selected-challenge">{selectedChallenge}</Text>
        <Pressable
          accessibilityRole="button"
          testID="select-memory-button"
          onPress={() => onChallengeSelect('memory')}
        >
          <Text>Select Memory</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/features/alarms/components/difficulty-selector', () => ({
  DifficultySelector: ({ selectedDifficulty, onDifficultyChange }: any) => {
    const { View, Pressable, Text } = require('react-native');
    return (
      <View testID="difficulty-selector">
        <Text testID="selected-difficulty">{selectedDifficulty}</Text>
        <Pressable
          accessibilityRole="button"
          testID="select-easy-button"
          onPress={() => onDifficultyChange('easy')}
        >
          <Text>Select Easy</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/features/alarms/components/backup-protocols-section', () => ({
  BackupProtocolsSection: ({ protocols, onProtocolToggle }: any) => {
    const { View, Pressable, Text } = require('react-native');
    return (
      <View testID="backup-protocols-section">
        {protocols.map((protocol: any) => (
          <Pressable
            accessibilityRole="button"
            key={protocol.id}
            testID={`protocol-${protocol.id}`}
            onPress={() => onProtocolToggle(protocol.id)}
          >
            <Text>
              {protocol.id}: {protocol.enabled ? 'enabled' : 'disabled'}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  },
}));

// Mock components
jest.mock('@/components/header', () => ({
  Header: ({ title, leftIcons, rightIcons }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="header">
        <Text testID="header-title">{title}</Text>
        {leftIcons?.map((icon: any, index: number) => (
          <Pressable
            accessibilityRole="button"
            key={index}
            testID="header-close-button"
            onPress={icon.onPress}
          >
            <Text>Close</Text>
          </Pressable>
        ))}
        {rightIcons?.map((icon: any, index: number) => (
          <Pressable
            accessibilityRole="button"
            key={index}
            testID="header-reset-button"
            onPress={icon.onPress}
          >
            <Text>Reset</Text>
          </Pressable>
        ))}
      </View>
    );
  },
}));

jest.mock('@/components/material-symbol', () => ({
  MaterialSymbol: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, ...props }: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText {...props}>{children}</RNText>;
  },
}));

describe('NewAlarmScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store
    const store = useAlarmsStore.getState();
    store.alarms.forEach((alarm) => {
      store.deleteAlarm(alarm.id);
    });
  });

  describe('Rendering', () => {
    it('should render the screen with default values', () => {
      const { getByTestId, getByText } = render(<NewAlarmScreen />);

      expect(getByTestId('header')).toBeTruthy();
      expect(getByText('New Alarm')).toBeTruthy();
      expect(getByTestId('time-picker-wheel')).toBeTruthy();
      expect(getByTestId('schedule-selector')).toBeTruthy();
      expect(getByTestId('cognitive-activation-section')).toBeTruthy();
      expect(getByTestId('difficulty-selector')).toBeTruthy();
      expect(getByTestId('backup-protocols-section')).toBeTruthy();
    });

    it('should display default time (06:00 AM)', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      const timeDisplay = getByTestId('time-display');
      expect(timeDisplay.props.children.join('')).toBe('6:0 AM');
    });

    it('should display default challenge (math)', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      const selectedChallenge = getByTestId('selected-challenge');
      expect(selectedChallenge.props.children).toBe(ChallengeType.MATH);
    });

    it('should display default difficulty (adaptive)', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      const selectedDifficulty = getByTestId('selected-difficulty');
      expect(selectedDifficulty.props.children).toBe(DifficultyLevel.ADAPTIVE);
    });

    it('should display commit button with formatted time', () => {
      const { getByText } = render(<NewAlarmScreen />);

      expect(getByText('Set alarm for 06:00 AM')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should close screen when close button is pressed', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      fireEvent.press(getByTestId('header-close-button'));

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should reset all fields when reset button is pressed', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Change some values
      fireEvent.press(getByTestId('change-time-button'));
      fireEvent.press(getByTestId('select-memory-button'));
      fireEvent.press(getByTestId('select-easy-button'));

      // Verify changes
      expect(getByTestId('time-display').props.children.join('')).toBe('7:30 PM');
      expect(getByTestId('selected-challenge').props.children).toBe(ChallengeType.MEMORY);
      expect(getByTestId('selected-difficulty').props.children).toBe(DifficultyLevel.EASY);

      // Reset
      fireEvent.press(getByTestId('header-reset-button'));

      // Verify reset to defaults
      expect(getByTestId('time-display').props.children.join('')).toBe('6:0 AM');
      expect(getByTestId('selected-challenge').props.children).toBe(ChallengeType.MATH);
      expect(getByTestId('selected-difficulty').props.children).toBe(DifficultyLevel.ADAPTIVE);
    });

    it('should update time when time picker changes', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      fireEvent.press(getByTestId('change-time-button'));

      const timeDisplay = getByTestId('time-display');
      expect(timeDisplay.props.children.join('')).toBe('7:30 PM');
    });

    it('should update challenge when challenge is selected', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      fireEvent.press(getByTestId('select-memory-button'));

      const selectedChallenge = getByTestId('selected-challenge');
      expect(selectedChallenge.props.children).toBe(ChallengeType.MEMORY);
    });

    it('should update difficulty when difficulty is selected', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      fireEvent.press(getByTestId('select-easy-button'));

      const selectedDifficulty = getByTestId('selected-difficulty');
      expect(selectedDifficulty.props.children).toBe(DifficultyLevel.EASY);
    });

    it('should toggle backup protocol when protocol is pressed', () => {
      const { getByTestId, getByText } = render(<NewAlarmScreen />);

      // Initial state: wake_check is enabled
      expect(getByText(`${BackupProtocolId.WAKE_CHECK}: enabled`)).toBeTruthy();

      // Toggle wake_check
      fireEvent.press(getByTestId(`protocol-${BackupProtocolId.WAKE_CHECK}`));

      // Should be disabled now
      expect(getByText(`${BackupProtocolId.WAKE_CHECK}: disabled`)).toBeTruthy();
    });
  });

  describe('Alarm Creation', () => {
    it('should create alarm with default values when commit button is pressed', async () => {
      const { getByText } = render(<NewAlarmScreen />);

      const commitButton = getByText('Set alarm for 06:00 AM');

      act(() => {
        fireEvent.press(commitButton);
      });

      await waitFor(() => {
        const store = useAlarmsStore.getState();
        expect(store.alarms).toHaveLength(1);
      });

      const store = useAlarmsStore.getState();
      expect(store.alarms[0]).toMatchObject({
        time: '06:00',
        period: Period.AM,
        challenge: 'Math Challenge',
        challengeIcon: 'calculate',
        schedule: 'Daily',
      });

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should create alarm with custom values', async () => {
      const { getByTestId, getByText } = render(<NewAlarmScreen />);

      // Change time
      act(() => {
        fireEvent.press(getByTestId('change-time-button'));
      });

      // Change challenge
      act(() => {
        fireEvent.press(getByTestId('select-memory-button'));
      });

      // Commit
      const commitButton = getByText('Set alarm for 07:30 PM');

      act(() => {
        fireEvent.press(commitButton);
      });

      await waitFor(() => {
        const store = useAlarmsStore.getState();
        expect(store.alarms).toHaveLength(1);
      });

      const store = useAlarmsStore.getState();
      expect(store.alarms[0]).toMatchObject({
        time: '07:30',
        period: Period.PM,
        challenge: 'Memory Challenge',
        challengeIcon: 'psychology',
      });

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should show alert when validation fails', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');

      // Add an alarm first to create a duplicate
      const store = useAlarmsStore.getState();
      store.addAlarm({
        time: '06:00',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: 'Daily',
      });

      const { getByText } = render(<NewAlarmScreen />);

      // Try to add duplicate alarm
      const commitButton = getByText('Set alarm for 06:00 AM');
      fireEvent.press(commitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Validation Error',
          expect.any(String),
          expect.any(Array)
        );
      });

      // Should not navigate back
      expect(mockBack).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('State Management', () => {
    it('should maintain independent state for all fields', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Change all fields
      fireEvent.press(getByTestId('change-time-button'));
      fireEvent.press(getByTestId('change-days-button'));
      fireEvent.press(getByTestId('select-memory-button'));
      fireEvent.press(getByTestId('select-easy-button'));
      fireEvent.press(getByTestId(`protocol-${BackupProtocolId.SNOOZE}`));

      // Verify all changes persisted
      expect(getByTestId('time-display').props.children.join('')).toBe('7:30 PM');
      expect(getByTestId('selected-days').props.children).toBe(DayOfWeek.TUESDAY);
      expect(getByTestId('selected-challenge').props.children).toBe(ChallengeType.MEMORY);
      expect(getByTestId('selected-difficulty').props.children).toBe(DifficultyLevel.EASY);
    });
  });
});
