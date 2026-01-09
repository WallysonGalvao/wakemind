import type { TimestampTrigger } from '@notifee/react-native';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';

import { Platform } from 'react-native';

import type { Alarm } from '@/types/alarm';
import { getNextTriggerTimestamp, isRepeatingAlarm } from '@/utils/alarm-time-calculator';

const ALARM_CHANNEL_ID = 'wakemind-alarm';
const ALARM_CHANNEL_NAME = 'Alarm Notifications';

export interface PermissionStatus {
  notifications: 'granted' | 'denied' | 'undetermined';
  exactAlarms: 'granted' | 'denied' | 'undetermined';
  fullScreen: 'granted' | 'denied' | 'undetermined';
}

/**
 * Initialize the alarm notification channel (Android)
 */
async function createAlarmChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: ALARM_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'alarm_sound',
    vibration: true,
    vibrationPattern: [300, 500],
    bypassDnd: true,
  });
}

/**
 * Check all required permissions for alarm scheduling
 */
export async function checkPermissions(): Promise<PermissionStatus> {
  const status: PermissionStatus = {
    notifications: 'undetermined',
    exactAlarms: 'undetermined',
    fullScreen: 'undetermined',
  };

  try {
    const settings = await notifee.getNotificationSettings();

    // Notification permission
    switch (settings.authorizationStatus) {
      case AuthorizationStatus.AUTHORIZED:
      case AuthorizationStatus.PROVISIONAL:
        status.notifications = 'granted';
        break;
      case AuthorizationStatus.DENIED:
        status.notifications = 'denied';
        break;
      default:
        status.notifications = 'undetermined';
    }

    // Android-specific permissions
    if (Platform.OS === 'android') {
      // Check exact alarms permission (Android 12+)
      const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
      status.exactAlarms = batteryOptimizationEnabled ? 'denied' : 'granted';

      // Full screen intent is typically granted by default for alarm apps
      status.fullScreen = 'granted';
    } else {
      // iOS doesn't have these specific permissions
      status.exactAlarms = 'granted';
      status.fullScreen = 'granted';
    }
  } catch (error) {
    console.error('[AlarmScheduler] Error checking permissions:', error);
  }

  return status;
}

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch (error) {
    console.error('[AlarmScheduler] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Open battery optimization settings (Android)
 */
export async function openBatteryOptimizationSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.openBatteryOptimizationSettings();
  }
}

/**
 * Open alarm permission settings (Android 12+)
 */
export async function openAlarmPermissionSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.openAlarmPermissionSettings();
  }
}

/**
 * Schedule an alarm notification
 */
export async function scheduleAlarm(alarm: Alarm): Promise<string> {
  // Check and request permissions first
  const settings = await notifee.getNotificationSettings();

  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
    const newSettings = await notifee.requestPermission();

    if (newSettings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      throw new Error('Notification permissions not granted');
    }
  }

  // Ensure channel exists
  await createAlarmChannel();

  const triggerTimestamp = getNextTriggerTimestamp(alarm);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTimestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: 'WakeMind Alarm',
      body: `${alarm.time} ${alarm.period} - ${alarm.challenge}`,
      data: {
        alarmId: alarm.id,
        time: alarm.time,
        period: alarm.period,
        challenge: alarm.challenge,
        challengeIcon: alarm.challengeIcon,
        isRepeating: isRepeatingAlarm(alarm).toString(),
      },
      android: {
        channelId: ALARM_CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        fullScreenAction: {
          id: 'alarm-triggered',
        },
        sound: 'alarm_sound',
        loopSound: true,
        ongoing: true,
        autoCancel: false,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: 'Snooze',
            pressAction: { id: 'snooze' },
          },
          {
            title: 'Dismiss',
            pressAction: { id: 'dismiss' },
          },
        ],
      },
      ios: {
        sound: 'alarm_sound.wav',
        critical: false,
        interruptionLevel: 'timeSensitive',
        categoryId: 'alarm',
      },
    },
    trigger
  );

  console.log(
    `[AlarmScheduler] Scheduled alarm ${alarm.id} for ${new Date(triggerTimestamp).toLocaleString()}`
  );

  return notificationId;
}

/**
 * Cancel a scheduled alarm
 */
export async function cancelAlarm(alarmId: string): Promise<void> {
  try {
    await notifee.cancelNotification(alarmId);
    console.log(`[AlarmScheduler] Cancelled alarm ${alarmId}`);
  } catch (error) {
    console.error(`[AlarmScheduler] Error cancelling alarm ${alarmId}:`, error);
  }
}

/**
 * Reschedule an alarm (cancel and schedule again)
 */
export async function rescheduleAlarm(alarm: Alarm): Promise<string> {
  await cancelAlarm(alarm.id);
  return scheduleAlarm(alarm);
}

/**
 * Cancel all scheduled alarms
 */
export async function cancelAllAlarms(): Promise<void> {
  try {
    await notifee.cancelAllNotifications();
    console.log('[AlarmScheduler] Cancelled all alarms');
  } catch (error) {
    console.error('[AlarmScheduler] Error cancelling all alarms:', error);
  }
}

/**
 * Get all scheduled alarm triggers
 */
export async function getScheduledAlarms(): Promise<string[]> {
  try {
    const triggers = await notifee.getTriggerNotificationIds();
    return triggers;
  } catch (error) {
    console.error('[AlarmScheduler] Error getting scheduled alarms:', error);
    return [];
  }
}

/**
 * Snooze an alarm for a specified duration
 */
export async function snoozeAlarm(alarm: Alarm, durationMinutes: number = 5): Promise<string> {
  // Cancel current notification
  await cancelAlarm(alarm.id);

  // Schedule snooze notification
  const snoozeTimestamp = Date.now() + durationMinutes * 60 * 1000;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: snoozeTimestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `${alarm.id}-snooze`,
      title: 'WakeMind - Snoozed',
      body: `Wake up! Snoozed from ${alarm.time} ${alarm.period}`,
      data: {
        alarmId: alarm.id,
        time: alarm.time,
        period: alarm.period,
        challenge: alarm.challenge,
        challengeIcon: alarm.challengeIcon,
        isSnooze: 'true',
      },
      android: {
        channelId: ALARM_CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        fullScreenAction: {
          id: 'alarm-triggered',
        },
        sound: 'alarm_sound',
        loopSound: true,
        ongoing: true,
        autoCancel: false,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: 'Dismiss',
            pressAction: { id: 'dismiss' },
          },
        ],
      },
      ios: {
        sound: 'alarm_sound.wav',
        interruptionLevel: 'timeSensitive',
        categoryId: 'alarm',
      },
    },
    trigger
  );

  console.log(`[AlarmScheduler] Snoozed alarm ${alarm.id} for ${durationMinutes} minutes`);

  return notificationId;
}

/**
 * Dismiss an alarm and reschedule if repeating
 */
export async function dismissAlarm(alarm: Alarm): Promise<void> {
  // Cancel current notification
  await cancelAlarm(alarm.id);
  await cancelAlarm(`${alarm.id}-snooze`);

  // If repeating, schedule for next occurrence
  if (isRepeatingAlarm(alarm) && alarm.isEnabled) {
    await scheduleAlarm(alarm);
  }

  console.log(`[AlarmScheduler] Dismissed alarm ${alarm.id}`);
}

/**
 * Initialize alarm scheduler
 */
export async function initializeAlarmScheduler(): Promise<void> {
  await createAlarmChannel();
  console.log('[AlarmScheduler] Initialized');
}

export const AlarmScheduler = {
  initialize: initializeAlarmScheduler,
  checkPermissions,
  requestPermissions,
  openBatteryOptimizationSettings,
  openAlarmPermissionSettings,
  scheduleAlarm,
  cancelAlarm,
  rescheduleAlarm,
  cancelAllAlarms,
  getScheduledAlarms,
  snoozeAlarm,
  dismissAlarm,
};
