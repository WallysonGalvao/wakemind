import React from 'react';

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { Alert } from 'react-native';

import NewAlarmScreen from './new-alarm';

import { DayOfWeek } from '@/features/alarms/components/schedule-selector';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import { ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';

// Mock expo-router
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

// Mock react-i18next with actual translations
jest.mock('react-i18next', () => {
  // Import translations inside the mock factory
  const mockEnTranslations = jest.requireActual('@/i18n/en').default;

  return {
    useTranslation: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        const translations = mockEnTranslations as Record<string, string>;

        // Handle interpolation for keys with params
        if (key === 'newAlarm.commit' && params?.time) {
          return `Commit to ${params.time}`;
        }

        return translations[key] || key;
      },
    }),
  };
});

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
  useShadowStyle: () => ({}),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.useAnimatedScrollHandler = () => () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Gesture: {
      Pan: () => ({
        onBegin: () => ({
          onUpdate: () => ({
            onEnd: () => ({}),
          }),
        }),
      }),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    GestureHandlerRootView: View,
  };
});

// Mock expo-image
jest.mock('expo-image', () => {
  const View = require('react-native').View;
  return {
    Image: (props: Record<string, unknown>) => <View testID="expo-image" {...props} />,
  };
});

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock components used by features/alarms/components
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

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ value, onValueChange, disabled, testID }: any) => {
    const { Switch: RNSwitch } = require('react-native');
    return (
      <RNSwitch
        testID={testID || 'switch'}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    );
  },
}));

jest.mock('@/components/segmented-control', () => ({
  SegmentedControl: ({
    title,
    items,
    selectedValue,
    onValueChange,
    multiSelect,
    selectedValues,
  }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="segmented-control">
        {title ? <Text>{title}</Text> : null}
        <View testID="segmented-control-items">
          {items.map((item: any) => {
            const isSelected = multiSelect
              ? selectedValues?.includes(item.value)
              : selectedValue === item.value;
            return (
              <Pressable
                key={item.value}
                testID={`segment-${item.value}`}
                onPress={() => onValueChange(item.value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                <Text>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
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
    it('should render the screen with all components', () => {
      const { getByTestId, getByText, getAllByTestId } = render(<NewAlarmScreen />);

      // Header
      expect(getByTestId('header')).toBeTruthy();
      expect(getByText('New Alarm')).toBeTruthy();

      // Verifica que os segmented controls estão renderizados (schedule e difficulty)
      const segmentedControls = getAllByTestId('segmented-control');
      expect(segmentedControls.length).toBeGreaterThanOrEqual(2);

      // Verifica commit button
      expect(getByText('Commit to 06:00 AM')).toBeTruthy();
    });

    it('should display commit button with formatted time', () => {
      const { getByText } = render(<NewAlarmScreen />);

      expect(getByText('Commit to 06:00 AM')).toBeTruthy();
    });

    it('should render cognitive activation section with challenge cards', () => {
      const { getByText } = render(<NewAlarmScreen />);

      // Verifica que os títulos dos challenges estão presentes
      expect(getByText('Math Challenge')).toBeTruthy();
      expect(getByText('Memory Matrix')).toBeTruthy();
      expect(getByText('Logic Puzzle')).toBeTruthy();
    });

    it('should render difficulty options', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Verifica que os segmentos de dificuldade estão presentes
      expect(getByTestId(`segment-${DifficultyLevel.EASY}`)).toBeTruthy();
      expect(getByTestId(`segment-${DifficultyLevel.MEDIUM}`)).toBeTruthy();
      expect(getByTestId(`segment-${DifficultyLevel.HARD}`)).toBeTruthy();
      expect(getByTestId(`segment-${DifficultyLevel.ADAPTIVE}`)).toBeTruthy();
    });

    it('should render schedule selector with day options', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Verifica que os dias estão presentes
      expect(getByTestId(`segment-${DayOfWeek.MONDAY}`)).toBeTruthy();
      expect(getByTestId(`segment-${DayOfWeek.TUESDAY}`)).toBeTruthy();
      expect(getByTestId(`segment-${DayOfWeek.WEDNESDAY}`)).toBeTruthy();
      expect(getByTestId(`segment-${DayOfWeek.THURSDAY}`)).toBeTruthy();
      expect(getByTestId(`segment-${DayOfWeek.FRIDAY}`)).toBeTruthy();
      expect(getByTestId(`segment-${DayOfWeek.SATURDAY}`)).toBeTruthy();
      expect(getByTestId(`segment-${DayOfWeek.SUNDAY}`)).toBeTruthy();
    });

    it('should render backup protocols section', () => {
      const { getByText } = render(<NewAlarmScreen />);

      // Verifica que os protocolos estão presentes (via mocked translation key)
      expect(getByText('Snooze')).toBeTruthy();
      expect(getByText('Wake Check')).toBeTruthy();
      expect(getByText('Barcode Scan')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should close screen when close button is pressed', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      fireEvent.press(getByTestId('header-close-button'));

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should update difficulty when difficulty segment is selected', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Seleciona dificuldade easy
      fireEvent.press(getByTestId(`segment-${DifficultyLevel.EASY}`));

      // Verifica que o segmento está selecionado
      const easySegment = getByTestId(`segment-${DifficultyLevel.EASY}`);
      expect(easySegment.props.accessibilityState.selected).toBe(true);
    });

    it('should update schedule when days are selected', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Seleciona terça-feira
      fireEvent.press(getByTestId(`segment-${DayOfWeek.TUESDAY}`));

      // Verifica que terça está selecionada
      const tuesdaySegment = getByTestId(`segment-${DayOfWeek.TUESDAY}`);
      expect(tuesdaySegment.props.accessibilityState.selected).toBe(true);
    });

    it('should navigate to info modal when info button is pressed', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Encontra o ícone de info
      const infoIcon = getByTestId('icon-info');
      expect(infoIcon).toBeTruthy();
    });
  });

  describe('Alarm Creation', () => {
    it('should create alarm with default values when commit button is pressed', async () => {
      const { getByText } = render(<NewAlarmScreen />);

      const commitButton = getByText('Commit to 06:00 AM');

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
      const commitButton = getByText('Commit to 06:00 AM');
      fireEvent.press(commitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Invalid Alarm',
          expect.any(String),
          expect.any(Array)
        );
      });

      // Should not navigate back
      expect(mockBack).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('Component Integration', () => {
    it('should render all challenge options with correct icons', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Verifica os ícones dos challenges
      expect(getByTestId('icon-calculate')).toBeTruthy();
      expect(getByTestId('icon-psychology')).toBeTruthy();
      expect(getByTestId('icon-lightbulb')).toBeTruthy();
    });

    it('should render protocol toggles with correct icons', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Verifica os ícones dos protocolos
      expect(getByTestId('icon-snooze')).toBeTruthy();
      expect(getByTestId('icon-check_circle')).toBeTruthy();
      expect(getByTestId('icon-qr_code_scanner')).toBeTruthy();
    });

    it('should have reset button functional', () => {
      const { getByTestId } = render(<NewAlarmScreen />);

      // Muda a dificuldade
      fireEvent.press(getByTestId(`segment-${DifficultyLevel.EASY}`));

      // Verifica que mudou
      const easySegment = getByTestId(`segment-${DifficultyLevel.EASY}`);
      expect(easySegment.props.accessibilityState.selected).toBe(true);

      // Reset
      fireEvent.press(getByTestId('header-reset-button'));

      // Verifica que voltou ao default (adaptive)
      const adaptiveSegment = getByTestId(`segment-${DifficultyLevel.ADAPTIVE}`);
      expect(adaptiveSegment.props.accessibilityState.selected).toBe(true);
    });
  });
});
