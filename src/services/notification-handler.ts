import type { Event } from '@notifee/react-native';
import notifee, { EventType } from '@notifee/react-native';
import type { Href } from 'expo-router';
import { router } from 'expo-router';

import { Platform } from 'react-native';

import { AlarmScheduler } from './alarm-scheduler';
import ExpoAlarmActivity from '../../modules/expo-alarm-activity';

import type { Alarm } from '@/types/alarm';
import type { Period } from '@/types/alarm-enums';
import { ChallengeType } from '@/types/alarm-enums';

export interface AlarmNotificationData {
  alarmId: string;
  time: string;
  period: Period;
  challenge: string;
  challengeIcon: string;
  isRepeating?: string;
  isSnooze?: string;
  type?: 'wake-check' | 'alarm';
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
      challengeType: ChallengeType.MATH, // Default for minimal alarm
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
    // Just cancel all notifications if we don't have alarm data
    await AlarmScheduler.cancelAllAlarmNotifications(data.alarmId);
  }

  callbacks.onDismiss?.(data.alarmId, data);
}

/**
 * Navigate to alarm trigger screen
 */
function navigateToAlarmScreen(data: AlarmNotificationData): void {
  try {
    const alarmId = data.alarmId || '';
    const time = data.time || '00:00';
    const period = data.period || 'AM';
    const challenge = data.challenge || 'Challenge';
    const challengeIcon = data.challengeIcon || 'calculate';
    const type = data.type || 'alarm';

    const url = `/alarm/trigger?alarmId=${alarmId}&time=${time}&period=${period}&challenge=${encodeURIComponent(challenge)}&challengeIcon=${challengeIcon}&type=${type}`;

    router.push(url as Href);
  } catch (error) {
    console.error('[NotificationHandler] Error navigating to alarm screen:', error);
  }
}

async function handleForegroundEvent(event: Event): Promise<void> {
  const { type, detail } = event;
  const data = detail.notification?.data as AlarmNotificationData | undefined;

  if (!data?.alarmId) return;

  switch (type) {
    case EventType.DELIVERED:
      // ANDROID: Abrir app automaticamente usando SYSTEM_ALERT_WINDOW
      if (Platform.OS === 'android') {
        try {
          ExpoAlarmActivity.openAlarmScreen(
            data.alarmId,
            data.time,
            data.period,
            data.challenge || 'Wake up!',
            data.challengeIcon || 'calculate',
            data.type || 'alarm'
          );
        } catch (error) {
          console.error('[NotificationHandler] Failed to open alarm screen:', error);
          navigateToAlarmScreen(data);
        }
      } else {
        navigateToAlarmScreen(data);
      }

      // Automatically reschedule repeating alarms when they trigger
      // This is the ONLY place where we reschedule - dismissAlarm should NOT reschedule
      // Skip rescheduling for snoozed alarms to avoid race condition
      if (data.isRepeating === 'true' && data.isSnooze !== 'true') {
        const alarm = callbacks.getAlarm?.(data.alarmId);
        if (alarm) {
          console.log('[NotificationHandler] Auto-rescheduling repeating alarm:', alarm.schedule);
          try {
            await AlarmScheduler.scheduleAlarm(alarm);
            console.log('[NotificationHandler] Repeating alarm rescheduled successfully');
          } catch (error) {
            console.error('[NotificationHandler] Failed to reschedule repeating alarm:', error);
          }
        } else {
          console.warn('[NotificationHandler] Cannot reschedule: alarm not found in store');
        }
      }

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
      // ANDROID: Abrir app automaticamente usando SYSTEM_ALERT_WINDOW
      if (Platform.OS === 'android') {
        try {
          ExpoAlarmActivity.openAlarmScreen(
            data.alarmId,
            data.time,
            data.period,
            data.challenge || 'Wake up!',
            data.challengeIcon || 'calculate',
            data.type || 'alarm'
          );
        } catch (error) {
          console.error('[NotificationHandler] Failed to open alarm screen:', error);
          navigateToAlarmScreen(data);
        }
      } else {
        navigateToAlarmScreen(data);
      }

      // Automatically reschedule repeating alarms when they trigger
      // This is critical for background alarms to ensure they repeat
      // Skip rescheduling for snoozed alarms to avoid race condition
      if (data.isRepeating === 'true' && data.isSnooze !== 'true') {
        const alarm = callbacks.getAlarm?.(data.alarmId);
        if (alarm) {
          console.log(
            '[NotificationHandler] Auto-rescheduling repeating alarm (bg):',
            alarm.schedule
          );
          try {
            await AlarmScheduler.scheduleAlarm(alarm);
            console.log('[NotificationHandler] Repeating alarm rescheduled successfully (bg)');
          } catch (error) {
            console.error(
              '[NotificationHandler] Failed to reschedule repeating alarm (bg):',
              error
            );
          }
        } else {
          console.warn('[NotificationHandler] Cannot reschedule (bg): alarm not found in store');
        }
      }

      callbacks.onAlarmTriggered?.(data.alarmId, data);
      break;

    case EventType.PRESS:
      // User tapped notification - navigate to alarm screen
      console.log('[NotificationHandler] Notification pressed (background):', data.alarmId);
      navigateToAlarmScreen(data);
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
      actions: [],
    },
    {
      id: 'alarm-snooze',
      actions: [
        {
          id: 'snooze',
          title: 'Snooze',
          foreground: true,
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

  // Register foreground event handler (async version)
  notifee.onForegroundEvent(async (event) => {
    await handleForegroundEvent(event);
  });
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
