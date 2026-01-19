import type { TimestampTrigger } from '@notifee/react-native';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import dayjs from 'dayjs';
import i18n from 'i18next';

import { Platform } from 'react-native';

import type { Alarm } from '@/types/alarm';
import { BackupProtocolId } from '@/types/alarm-enums';
import { getNextTriggerTimestamp, isRepeatingAlarm } from '@/utils/alarm-time-calculator';

const ALARM_CHANNEL_ID = 'wakemind-alarm';

export interface PermissionStatus {
  notifications: 'granted' | 'denied' | 'undetermined';
  exactAlarms: 'granted' | 'denied' | 'undetermined';
  fullScreen: 'granted' | 'denied' | 'undetermined';
  batteryOptimization: 'granted' | 'denied' | 'undetermined';
}

/**
 * Initialize the alarm notification channel (Android)
 */
async function createAlarmChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: i18n.t('alarmScheduler.channel.name'),
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'alarm_sound',
    vibration: true,
    vibrationPattern: [300, 500],
    bypassDnd: true,
    lights: false,
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
    batteryOptimization: 'undetermined',
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
      // Use settings.android.alarm to check SCHEDULE_EXACT_ALARM permission
      if (settings.android?.alarm !== undefined) {
        status.exactAlarms = settings.android.alarm === 1 ? 'granted' : 'denied';
      } else {
        // Fallback: assume granted on older Android versions
        status.exactAlarms = 'granted';
      }

      // Check battery optimization (important for alarm reliability)
      const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
      status.batteryOptimization = batteryOptimizationEnabled ? 'denied' : 'granted';

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
 * Request notification permissions (including Critical Alerts on iOS)
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission({
      criticalAlert: true,
      sound: true,
      alert: true,
      badge: true,
    });
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
      throw new Error(i18n.t('alarmScheduler.errors.permissionsNotGranted'));
    }
  }

  // Ensure channel exists
  await createAlarmChannel();

  // Cancel any existing notifications for this alarm before scheduling new one
  await cancelAllAlarmNotifications(alarm.id);

  const triggerTimestamp = getNextTriggerTimestamp(alarm);
  const triggerDate = dayjs(triggerTimestamp);
  const isRepeating = isRepeatingAlarm(alarm);

  // Log scheduling information for debugging
  console.log('[AlarmScheduler] Scheduling alarm:', {
    id: alarm.id,
    time: alarm.time,
    schedule: alarm.schedule,
    isRepeating,
    triggerDate: triggerDate.toISOString(),
    triggerTimestamp,
  });

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTimestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  // Build actions dynamically based on alarm protocols
  const actions = [];

  // Check if snooze protocol is enabled
  const isSnoozeEnabled =
    alarm.protocols?.some(
      (protocol) => protocol.id === BackupProtocolId.SNOOZE && protocol.enabled
    ) ?? false;

  if (isSnoozeEnabled) {
    actions.push({
      title: i18n.t('alarmScheduler.actions.snooze'),
      pressAction: { id: 'snooze' },
    });
  }

  const notificationId = await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: i18n.t('alarmScheduler.notification.title'),
      body: i18n.t('alarmScheduler.notification.body', {
        time: alarm.time,
        period: alarm.period,
        challenge: alarm.challenge,
      }),
      data: {
        alarmId: alarm.id,
        time: alarm.time,
        period: alarm.period,
        challenge: alarm.challenge,
        challengeIcon: alarm.challengeIcon,
        isRepeating: isRepeating.toString(),
        schedule: alarm.schedule,
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
        actions,
      },
      ios: {
        sound: 'alarm_sound.wav',
        critical: true,
        criticalVolume: 1.0,
        interruptionLevel: 'critical',
        categoryId: isSnoozeEnabled ? 'alarm-snooze' : 'alarm',
      },
    },
    trigger
  );

  console.log('[AlarmScheduler] Alarm scheduled successfully:', notificationId);

  return notificationId;
}

/**
 * Cancel a scheduled alarm
 */
export async function cancelAlarm(alarmId: string): Promise<void> {
  try {
    await notifee.cancelNotification(alarmId);
  } catch (error) {
    console.error(`[AlarmScheduler] Error cancelling alarm ${alarmId}:`, error);
  }
}

/**
 * Cancel all notifications related to an alarm (main, snooze, wake-check)
 */
export async function cancelAllAlarmNotifications(alarmId: string): Promise<void> {
  try {
    console.log(`[AlarmScheduler] Cancelling all notifications for alarm ${alarmId}`);
    await notifee.cancelNotification(alarmId);
    await notifee.cancelNotification(`${alarmId}-snooze`);
    await notifee.cancelNotification(`${alarmId}-wake-check`);
  } catch (error) {
    console.error(`[AlarmScheduler] Error cancelling all alarm notifications ${alarmId}:`, error);
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
  // Cancel all notifications related to this alarm before snoozing
  await cancelAllAlarmNotifications(alarm.id);

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
      title: i18n.t('alarmScheduler.notification.snooze.title'),
      body: i18n.t('alarmScheduler.notification.snooze.body', {
        time: alarm.time,
        period: alarm.period,
      }),
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
            title: i18n.t('alarmScheduler.actions.dismiss'),
            pressAction: { id: 'dismiss' },
          },
        ],
      },
      ios: {
        sound: 'alarm_sound.wav',
        critical: true,
        criticalVolume: 1.0,
        interruptionLevel: 'critical',
        categoryId: 'alarm',
      },
    },
    trigger
  );

  return notificationId;
}

/**
 * Dismiss an alarm
 * Note: Rescheduling for repeating alarms is handled automatically
 * in the notification DELIVERED event handler to avoid double scheduling
 */
export async function dismissAlarm(alarm: Alarm): Promise<void> {
  console.log('[AlarmScheduler] Dismissing alarm:', alarm.id);

  // Cancel all notifications related to this alarm
  await cancelAllAlarmNotifications(alarm.id);

  // NOTE: We do NOT reschedule here anymore
  // Rescheduling is handled in notification-handler.ts when DELIVERED event fires
  // This avoids double-scheduling the same alarm
  console.log('[AlarmScheduler] Alarm dismissed (rescheduling handled by DELIVERED event)');
}

/**
 * Schedule a wake check notification 5 minutes after alarm dismissal
 */
export async function scheduleWakeCheck(alarm: Alarm): Promise<string> {
  const notificationId = `${alarm.id}-wake-check`;
  const triggerTimestamp = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  // Calculate the next wake check time to display
  const wakeCheckDate = dayjs(triggerTimestamp);
  const hours = wakeCheckDate.hour();
  const minutes = wakeCheckDate.minute();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayTime = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTimestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: i18n.t('alarmScheduler.notification.wakeCheck.title'),
      body: i18n.t('alarmScheduler.notification.wakeCheck.body'),
      data: {
        alarmId: alarm.id,
        type: 'wake-check',
        time: displayTime,
        period,
        challenge: alarm.challenge,
        challengeIcon: alarm.challengeIcon,
      },
      android: {
        channelId: ALARM_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'alarm_sound',
        vibrationPattern: [300, 500],
        pressAction: {
          id: 'wake-check-confirm',
          launchActivity: 'default',
        },
        actions: [
          {
            title: i18n.t('alarmScheduler.actions.awake'),
            pressAction: { id: 'wake-check-confirm' },
          },
        ],
      },
      ios: {
        sound: 'default',
        interruptionLevel: 'timeSensitive',
      },
    },
    trigger
  );

  return notificationId;
}

/**
 * Initialize alarm scheduler
 */
export async function initializeAlarmScheduler(): Promise<void> {
  await createAlarmChannel();
}

export const AlarmScheduler = {
  initialize: initializeAlarmScheduler,
  checkPermissions,
  requestPermissions,
  openBatteryOptimizationSettings,
  openAlarmPermissionSettings,
  scheduleAlarm,
  cancelAlarm,
  cancelAllAlarmNotifications,
  rescheduleAlarm,
  cancelAllAlarms,
  getScheduledAlarms,
  snoozeAlarm,
  dismissAlarm,
  scheduleWakeCheck,
};
