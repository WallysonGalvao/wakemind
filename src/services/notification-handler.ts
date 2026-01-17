import type { Event } from '@notifee/react-native';
import notifee, { EventType } from '@notifee/react-native';
import type { Href } from 'expo-router';
import { router } from 'expo-router';

import { Platform } from 'react-native';

import { AlarmScheduler } from './alarm-scheduler';

import type { Alarm } from '@/types/alarm';
import type { Period } from '@/types/alarm-enums';

export interface AlarmNotificationData {
  alarmId: string;
  time: string;
  period: Period;
  challenge: string;
  challengeIcon: string;
  isRepeating?: string;
  isSnooze?: string;
}

type AlarmEventCallback = (alarmId: string, data: AlarmNotificationData) => void;
type SnoozeCallback = (alarmId: string, data: AlarmNotificationData) => void;
type DismissCallback = (alarmId: string, data: AlarmNotificationData) => void;

interface NotificationHandlerCallbacks {
  onAlarmTriggered?: AlarmEventCallback;
  onSnooze?: SnoozeCallback;
  onDismiss?: DismissCallback;
  getAlarm?: (alarmId: string) => Alarm | undefined;
}

let callbacks: NotificationHandlerCallbacks = {};

/**
 * Set callbacks for notification events
 */
export function setNotificationCallbacks(newCallbacks: NotificationHandlerCallbacks): void {
  callbacks = { ...callbacks, ...newCallbacks };
}

/**
 * Handle snooze action
 */
async function handleSnoozeAction(data: AlarmNotificationData): Promise<void> {
  const alarm = callbacks.getAlarm?.(data.alarmId);
  if (alarm) {
    await AlarmScheduler.snoozeAlarm(alarm, 5);
  } else {
    // If we don't have the alarm data, create a minimal one for snoozing
    const minimalAlarm: Alarm = {
      id: data.alarmId,
      time: data.time,
      period: data.period,
      challenge: data.challenge,
      challengeIcon: data.challengeIcon,
      schedule: 'Once',
      isEnabled: true,
    };
    await AlarmScheduler.snoozeAlarm(minimalAlarm, 5);
  }

  callbacks.onSnooze?.(data.alarmId, data);
}

/**
 * Handle dismiss action
 */
async function handleDismissAction(data: AlarmNotificationData): Promise<void> {
  const alarm = callbacks.getAlarm?.(data.alarmId);
  if (alarm) {
    await AlarmScheduler.dismissAlarm(alarm);
  } else {
    // Just cancel the notification if we don't have alarm data
    await AlarmScheduler.cancelAlarm(data.alarmId);
    await AlarmScheduler.cancelAlarm(`${data.alarmId}-snooze`);
  }

  callbacks.onDismiss?.(data.alarmId, data);
}

/**
 * Navigate to alarm trigger screen
 */
function navigateToAlarmScreen(data: AlarmNotificationData): void {
  try {
    const url = `/alarm/trigger?alarmId=${data.alarmId}&time=${data.time}&period=${data.period}&challenge=${encodeURIComponent(data.challenge)}&challengeIcon=${data.challengeIcon}`;
    router.push(url as Href);
  } catch (error) {
    console.error('[NotificationHandler] Error navigating to alarm screen:', error);
  }
}

/**
 * Handle Notifee foreground events
 */
function handleForegroundEvent(event: Event): void {
  const { type, detail } = event;
  const data = detail.notification?.data as AlarmNotificationData | undefined;

  if (!data?.alarmId) return;

  switch (type) {
    case EventType.DELIVERED:
      // Navigate to alarm trigger screen
      navigateToAlarmScreen(data);
      callbacks.onAlarmTriggered?.(data.alarmId, data);
      break;

    case EventType.PRESS:
      navigateToAlarmScreen(data);
      break;

    case EventType.ACTION_PRESS:
      const actionId = detail.pressAction?.id;

      if (actionId === 'snooze') {
        handleSnoozeAction(data);
      } else if (actionId === 'dismiss') {
        handleDismissAction(data);
      }
      break;

    case EventType.DISMISSED:
      break;
  }
}

/**
 * Handle Notifee background events
 * IMPORTANT: This must be registered at module level for iOS
 */
async function handleBackgroundEvent(event: Event): Promise<void> {
  const { type, detail } = event;
  const data = detail.notification?.data as AlarmNotificationData | undefined;

  if (!data?.alarmId) return;

  switch (type) {
    case EventType.DELIVERED:
      // Alarm triggered in background - full screen intent will handle it on Android
      break;

    case EventType.PRESS:
      // User tapped notification
      break;

    case EventType.ACTION_PRESS:
      const actionId = detail.pressAction?.id;

      if (actionId === 'snooze') {
        await handleSnoozeAction(data);
      } else if (actionId === 'dismiss') {
        await handleDismissAction(data);
      }
      break;
  }
}

// Register background event handler at module level (required for iOS)
notifee.onBackgroundEvent(handleBackgroundEvent);

/**
 * Setup iOS notification categories with actions
 */
async function setupIOSCategories(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  await notifee.setNotificationCategories([
    {
      id: 'alarm',
      actions: [
        {
          id: 'snooze',
          title: 'Snooze',
          foreground: true,
        },
        {
          id: 'dismiss',
          title: 'Dismiss',
          foreground: true,
          destructive: true,
        },
      ],
    },
  ]);
}

/**
 * Initialize notification handlers
 */
export async function initializeNotificationHandler(): Promise<void> {
  // Setup iOS categories
  await setupIOSCategories();

  notifee.onForegroundEvent(handleForegroundEvent);
}

/**
 * Clean up notification handlers
 */
export function cleanupNotificationHandler(): void {
  callbacks = {};
}

export const NotificationHandler = {
  initialize: initializeNotificationHandler,
  cleanup: cleanupNotificationHandler,
  setCallbacks: setNotificationCallbacks,
};
