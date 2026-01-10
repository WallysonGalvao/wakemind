import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AlarmsScreen from './index';

import { useAlarmsStore } from '@/stores/use-alarms-store';
import { Period } from '@/types/alarm-enums';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock react-i18next with actual translations
jest.mock('react-i18next', () => {
  const mockEnTranslations = jest.requireActual('@/i18n/en').default;

  return {
    useTranslation: () => ({
      t: (key: string) => {
        const translations = mockEnTranslations as Record<string, string>;
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

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock custom hooks
jest.mock('@/hooks/use-shadow-style', () => ({
  useCustomShadow: () => ({}),
  useShadowStyle: () => ({}),
}));

jest.mock('@/hooks/use-theme', () => ({
  useIsDarkMode: () => false,
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.useAnimatedScrollHandler = () => () => {};
  return Reanimated;
});

// Mock expo-image
jest.mock('expo-image', () => {
  const View = require('react-native').View;
  return {
    Image: (props: Record<string, unknown>) => <View testID="expo-image" {...props} />,
  };
});

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock @shopify/flash-list
jest.mock('@shopify/flash-list', () => {
  const { FlatList, View } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
      ListHeaderComponent,
      ListEmptyComponent,
      keyExtractor,
      ItemSeparatorComponent,
    }: any) => {
      if (!data || data.length === 0) {
        return (
          <View testID="flash-list-empty">
            {ListEmptyComponent ? <ListEmptyComponent /> : null}
          </View>
        );
      }
      return (
        <View testID="flash-list">
          {ListHeaderComponent ? <ListHeaderComponent /> : null}
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparatorComponent}
          />
        </View>
      );
    },
  };
});

// Mock MaterialSymbol
jest.mock('@/components/material-symbol', () => ({
  MaterialSymbol: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

// Mock Text component
jest.mock('@/components/ui/text', () => ({
  Text: ({ children, ...props }: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText {...props}>{children}</RNText>;
  },
}));

// Mock Switch component
jest.mock('@/components/ui/switch', () => ({
  Switch: ({ value, onValueChange, testID }: any) => {
    const { Switch: RNSwitch } = require('react-native');
    return (
      <RNSwitch testID={testID || 'alarm-switch'} value={value} onValueChange={onValueChange} />
    );
  },
}));

// Mock FloatingActionButton
jest.mock('@/components/floating-action-button', () => ({
  FloatingActionButton: ({ label, onPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="fab" onPress={onPress} accessibilityRole="button">
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

// Mock EmptyState
jest.mock('../components/empty-state', () => ({
  EmptyState: ({ title, description, children }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="empty-state">
        <Text testID="empty-state-title">{title}</Text>
        <Text testID="empty-state-description">{description}</Text>
        {children}
      </View>
    );
  },
}));

// Mock AlarmsHeader
jest.mock('../components/alarms-header', () => ({
  AlarmsHeader: ({ title, editLabel, doneLabel, isEditMode, onEditPress }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="alarms-header">
        <Text testID="header-title">{title}</Text>
        <Pressable testID="edit-button" onPress={onEditPress} accessibilityRole="button">
          <Text>{isEditMode ? doneLabel : editLabel}</Text>
        </Pressable>
      </View>
    );
  },
}));

// Mock AlarmCard
jest.mock('../components/alarm-card', () => ({
  AlarmCard: ({ alarm, onToggle, onPress, onDelete, isEditMode }: any) => {
    const { View, Text, Pressable, Switch } = require('react-native');
    return (
      <View testID={`alarm-card-${alarm.id}`}>
        <Text testID={`alarm-time-${alarm.id}`}>{alarm.time}</Text>
        <Text testID={`alarm-period-${alarm.id}`}>{alarm.period}</Text>
        {isEditMode ? (
          <Pressable
            testID={`delete-button-${alarm.id}`}
            onPress={() => onDelete(alarm.id)}
            accessibilityRole="button"
          >
            <Text>Delete</Text>
          </Pressable>
        ) : (
          <Switch
            testID={`toggle-${alarm.id}`}
            value={alarm.isEnabled}
            onValueChange={() => onToggle(alarm.id)}
          />
        )}
        <Pressable
          testID={`card-press-${alarm.id}`}
          onPress={() => onPress(alarm.id)}
          accessibilityRole="button"
        >
          <Text>Press</Text>
        </Pressable>
      </View>
    );
  },
}));

describe('AlarmsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store
    const store = useAlarmsStore.getState();
    store.alarms.forEach((alarm) => {
      store.deleteAlarm(alarm.id);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no alarms exist', () => {
      const { getByTestId, getByText } = render(<AlarmsScreen />);

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByTestId('empty-state-title')).toBeTruthy();
      expect(getByTestId('empty-state-description')).toBeTruthy();
      expect(getByText('Set Your First Alarm')).toBeTruthy();
    });

    it('should navigate to create alarm when CTA button is pressed', () => {
      const { getByText } = render(<AlarmsScreen />);

      const ctaButton = getByText('Set Your First Alarm');
      fireEvent.press(ctaButton);

      expect(mockPush).toHaveBeenCalledWith('/alarm/create-alarm');
    });

    it('should not render FAB when no alarms exist', () => {
      const { queryByTestId } = render(<AlarmsScreen />);

      expect(queryByTestId('fab')).toBeNull();
    });
  });

  describe('With Alarms', () => {
    beforeEach(() => {
      const store = useAlarmsStore.getState();
      store.addAlarm({
        time: '06:00',
        period: Period.AM,
        challenge: 'Math Challenge',
        challengeIcon: 'calculate',
        schedule: 'Daily',
      });
    });

    it('should render alarm cards when alarms exist', () => {
      const { getByTestId, queryByTestId } = render(<AlarmsScreen />);

      expect(queryByTestId('empty-state')).toBeNull();
      expect(getByTestId('alarms-header')).toBeTruthy();

      const store = useAlarmsStore.getState();
      const alarmId = store.alarms[0].id;
      expect(getByTestId(`alarm-card-${alarmId}`)).toBeTruthy();
    });

    it('should render FAB when alarms exist', () => {
      const { getByTestId } = render(<AlarmsScreen />);

      expect(getByTestId('fab')).toBeTruthy();
    });

    it('should navigate to create alarm when FAB is pressed', () => {
      const { getByTestId } = render(<AlarmsScreen />);

      fireEvent.press(getByTestId('fab'));

      expect(mockPush).toHaveBeenCalledWith('/alarm/create-alarm');
    });

    it('should render header with Edit button', () => {
      const { getByTestId, getByText } = render(<AlarmsScreen />);

      expect(getByTestId('alarms-header')).toBeTruthy();
      expect(getByText('Edit')).toBeTruthy();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      const store = useAlarmsStore.getState();
      store.addAlarm({
        time: '07:00',
        period: Period.AM,
        challenge: 'Math Challenge',
        challengeIcon: 'calculate',
        schedule: 'Daily',
      });
    });

    it('should toggle edit mode when Edit button is pressed', () => {
      const { getByTestId, getByText, queryByText } = render(<AlarmsScreen />);

      // Initially shows "Edit"
      expect(getByText('Edit')).toBeTruthy();

      // Press Edit button
      fireEvent.press(getByTestId('edit-button'));

      // Now shows "Done"
      expect(getByText('Done')).toBeTruthy();
      expect(queryByText('Edit')).toBeNull();
    });

    it('should hide FAB when in edit mode', () => {
      const { getByTestId, queryByTestId } = render(<AlarmsScreen />);

      // FAB visible initially
      expect(getByTestId('fab')).toBeTruthy();

      // Enter edit mode
      fireEvent.press(getByTestId('edit-button'));

      // FAB hidden
      expect(queryByTestId('fab')).toBeNull();
    });

    it('should show FAB again when exiting edit mode', () => {
      const { getByTestId, queryByTestId } = render(<AlarmsScreen />);

      // Enter edit mode
      fireEvent.press(getByTestId('edit-button'));
      expect(queryByTestId('fab')).toBeNull();

      // Exit edit mode
      fireEvent.press(getByTestId('edit-button'));
      expect(getByTestId('fab')).toBeTruthy();
    });

    it('should show delete button on alarm cards in edit mode', () => {
      const { getByTestId } = render(<AlarmsScreen />);

      const store = useAlarmsStore.getState();
      const alarmId = store.alarms[0].id;

      // Enter edit mode
      fireEvent.press(getByTestId('edit-button'));

      // Delete button should be visible
      expect(getByTestId(`delete-button-${alarmId}`)).toBeTruthy();
    });

    it('should delete alarm when delete button is pressed', async () => {
      const { getByTestId } = render(<AlarmsScreen />);

      const storeBefore = useAlarmsStore.getState();
      const alarmId = storeBefore.alarms[0].id;
      expect(storeBefore.alarms).toHaveLength(1);

      // Enter edit mode
      fireEvent.press(getByTestId('edit-button'));

      // Press delete
      fireEvent.press(getByTestId(`delete-button-${alarmId}`));

      await waitFor(() => {
        const storeAfter = useAlarmsStore.getState();
        expect(storeAfter.alarms).toHaveLength(0);
      });
    });

    it('should exit edit mode when last alarm is deleted', async () => {
      const { getByTestId, getByText } = render(<AlarmsScreen />);

      const store = useAlarmsStore.getState();
      const alarmId = store.alarms[0].id;

      // Enter edit mode
      fireEvent.press(getByTestId('edit-button'));
      expect(getByText('Done')).toBeTruthy();

      // Delete the only alarm
      fireEvent.press(getByTestId(`delete-button-${alarmId}`));

      await waitFor(() => {
        const storeAfter = useAlarmsStore.getState();
        expect(storeAfter.alarms).toHaveLength(0);
      });
    });
  });

  describe('Alarm Interactions', () => {
    beforeEach(() => {
      const store = useAlarmsStore.getState();
      store.addAlarm({
        time: '08:00',
        period: Period.AM,
        challenge: 'Math Challenge',
        challengeIcon: 'calculate',
        schedule: 'Daily',
      });
    });

    it('should toggle alarm when switch is pressed', async () => {
      const { getByTestId } = render(<AlarmsScreen />);

      const store = useAlarmsStore.getState();
      const alarmId = store.alarms[0].id;
      const initialEnabled = store.alarms[0].isEnabled;

      fireEvent(getByTestId(`toggle-${alarmId}`), 'onValueChange');

      await waitFor(() => {
        const updatedStore = useAlarmsStore.getState();
        expect(updatedStore.alarms[0].isEnabled).toBe(!initialEnabled);
      });
    });

    it('should navigate to edit alarm when card is pressed', () => {
      const { getByTestId } = render(<AlarmsScreen />);

      const store = useAlarmsStore.getState();
      const alarmId = store.alarms[0].id;

      fireEvent.press(getByTestId(`card-press-${alarmId}`));

      expect(mockPush).toHaveBeenCalledWith(`/alarm/edit-alarm?alarmId=${alarmId}`);
    });
  });

  describe('Multiple Alarms', () => {
    beforeEach(() => {
      const store = useAlarmsStore.getState();
      store.addAlarm({
        time: '06:00',
        period: Period.AM,
        challenge: 'Math Challenge',
        challengeIcon: 'calculate',
        schedule: 'Daily',
      });
      store.addAlarm({
        time: '07:30',
        period: Period.PM,
        challenge: 'Memory Matrix',
        challengeIcon: 'psychology',
        schedule: 'Weekdays',
      });
    });

    it('should render multiple alarm cards', () => {
      const { getAllByTestId } = render(<AlarmsScreen />);

      const store = useAlarmsStore.getState();
      expect(store.alarms).toHaveLength(2);

      store.alarms.forEach((alarm) => {
        expect(getAllByTestId(`alarm-card-${alarm.id}`)).toBeTruthy();
      });
    });

    it('should not exit edit mode when deleting one of multiple alarms', async () => {
      const { getByTestId, getByText } = render(<AlarmsScreen />);

      const store = useAlarmsStore.getState();
      const firstAlarmId = store.alarms[0].id;

      // Enter edit mode
      fireEvent.press(getByTestId('edit-button'));
      expect(getByText('Done')).toBeTruthy();

      // Delete first alarm
      fireEvent.press(getByTestId(`delete-button-${firstAlarmId}`));

      await waitFor(() => {
        const storeAfter = useAlarmsStore.getState();
        expect(storeAfter.alarms).toHaveLength(1);
      });

      // Should still be in edit mode
      expect(getByText('Done')).toBeTruthy();
    });
  });
});
