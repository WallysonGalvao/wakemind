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

import { NativeModules, Platform } from 'react-native';

import { getToneFilename } from '@/constants/alarm-tones';
import { useSettingsStore } from '@/stores/use-settings-store';
import type { Alarm } from '@/types/alarm';
import { BackupProtocolId } from '@/types/alarm-enums';
import { getNextTriggerTimestamp, isRepeatingAlarm } from '@/utils/alarm-time-calculator';

const ALARM_CHANNEL_ID = 'wakemind-alarm';

export interface PermissionStatus {
  notifications: 'granted' | 'denied' | 'undetermined';
  exactAlarms: 'granted' | 'denied' | 'undetermined';
  fullScreen: 'granted' | 'denied' | 'undetermined';
  batteryOptimization: 'granted' | 'denied' | 'undetermined';
  displayOverOtherApps: 'granted' | 'denied' | 'undetermined';
  autoStart: 'granted' | 'denied' | 'undetermined';
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

  console.log('[AlarmScheduler] Alarm channel created with HIGH importance');
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
    displayOverOtherApps: 'undetermined',
    autoStart: 'undetermined',
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

      // Check SYSTEM_ALERT_WINDOW permission (Display over other apps)
      try {
        const { OverlayPermission } = NativeModules;

        if (OverlayPermission && typeof OverlayPermission.canDrawOverlays === 'function') {
          const canDrawOverlays = await OverlayPermission.canDrawOverlays();
          status.displayOverOtherApps = canDrawOverlays ? 'granted' : 'denied';
        } else {
          // Assume granted if module not available (shouldn't happen)
          status.displayOverOtherApps = 'undetermined';
        }
      } catch (error) {
        console.warn('[AlarmScheduler] Could not check overlay permission:', error);
        status.displayOverOtherApps = 'undetermined';
      }

      // Full screen intent is typically granted by default for alarm apps
      status.fullScreen = 'granted';

      // AutoStart permission cannot be checked programmatically
      // We assume it's undetermined and guide users to enable it manually
      status.autoStart = 'undetermined';
    } else {
      // iOS doesn't have these specific permissions
      status.exactAlarms = 'granted';
      status.fullScreen = 'granted';
      status.displayOverOtherApps = 'granted';
      status.autoStart = 'granted';
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

    // On Android, also check for full screen intent permission
    if (Platform.OS === 'android') {
      console.log('[AlarmScheduler] Notification permission granted');
      console.log(
        '[AlarmScheduler] Note: Full screen intent may need manual enabling in system settings'
      );
      console.log(
        '[AlarmScheduler] Path: Settings > Apps > WakeMind > Notifications > Full screen intent'
      );
    }

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
 * Open app notification settings to enable Full Screen Intent
 * This is required on Android 14+ for alarm notifications to show over lock screen
 */
export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.openNotificationSettings();
  }
}

/**
 * Open system settings to allow displaying over other apps (SYSTEM_ALERT_WINDOW)
 * This is CRITICAL for alarms to auto-launch when app is in foreground/background
 */
export async function openDisplayOverOtherAppsSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const { OverlayPermission } = NativeModules;

      if (OverlayPermission && typeof OverlayPermission.openSettings === 'function') {
        await OverlayPermission.openSettings();
      } else {
        // Fallback: open app notification settings
        console.warn('[AlarmScheduler] OverlayPermission module not available, using fallback');
        await notifee.openNotificationSettings();
      }
    } catch (error) {
      console.error('[AlarmScheduler] Error opening overlay settings:', error);
      // Last resort: open notification settings
      await notifee.openNotificationSettings();
    }
  }
}

/**
 * Open manufacturer-specific AutoStart settings
 * This is CRITICAL for Xiaomi, Huawei, Oppo, Vivo, Samsung devices
 * Allows the app to start automatically in background and show alarms
 */
export async function openAutoStartSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const { OverlayPermission } = NativeModules;

      if (OverlayPermission && typeof OverlayPermission.openAutoStartSettings === 'function') {
        await OverlayPermission.openAutoStartSettings();
      } else {
        console.warn('[AlarmScheduler] OverlayPermission module not available');
      }
    } catch (error) {
      console.error('[AlarmScheduler] Error opening auto-start settings:', error);
    }
  }
}

/**
 * Get device manufacturer name
 */
export async function getDeviceManufacturer(): Promise<string> {
  if (Platform.OS === 'android') {
    try {
      const { OverlayPermission } = NativeModules;

      if (OverlayPermission && typeof OverlayPermission.getManufacturer === 'function') {
        return await OverlayPermission.getManufacturer();
      }
    } catch (error) {
      console.error('[AlarmScheduler] Error getting manufacturer:', error);
    }
  }
  return 'unknown';
}

/**
 * Schedule an alarm notification
 * Uses native AlarmManager on Android for reliable triggering
 * Uses Notifee on iOS for critical notifications
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

  // Ensure channel exists (for Notifee and Android notifications)
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
        // Translate the challenge text if it's an i18n key, otherwise use as-is
        challenge: alarm.challenge?.includes('.') ? i18n.t(alarm.challenge) : alarm.challenge || '',
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
        showTimestamp: true,
        timestamp: triggerTimestamp,
        showChronometer: false,
        fullScreenAction: {
          id: 'alarm-triggered',
          launchActivity: 'com.wgsoftwares.wakemind.MainActivity',
        },
        sound: 'alarm_sound',
        loopSound: true,
        ongoing: true,
        autoCancel: false,
        onlyAlertOnce: false,
        actions,
        lightUpScreen: true,
      },
      ios: {
        sound: getToneFilename(useSettingsStore.getState().alarmToneId),
        critical: true,
        criticalVolume: 1.0,
        interruptionLevel: 'critical',
        categoryId: isSnoozeEnabled ? 'alarm-snooze' : 'alarm',
      },
    },
    trigger
  );

  console.log('[AlarmScheduler] Alarm scheduled successfully:', notificationId);
  console.log(
    "[AlarmScheduler] Full Screen Intent configured - ensure it's enabled in Settings > Apps > WakeMind > Notifications"
  );

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
          launchActivity: 'com.wgsoftwares.wakemind.MainActivity',
        },
        sound: 'alarm_sound',
        loopSound: true,
        ongoing: true,
        autoCancel: false,
        onlyAlertOnce: false,
        actions: [
          {
            title: i18n.t('alarmScheduler.actions.dismiss'),
            pressAction: { id: 'dismiss' },
          },
        ],
      },
      ios: {
        sound: getToneFilename(useSettingsStore.getState().alarmToneId),
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
        onlyAlertOnce: false,
        pressAction: {
          id: 'wake-check-confirm',
          launchActivity: 'com.wgsoftwares.wakemind.MainActivity',
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

/**
 * TEST: Schedule a test alarm notification for 10 seconds in the future
 * This tests if Notifee's fullScreenAction can open AlarmActivity
 */
export async function testNotifeeFullScreenIntent(): Promise<string> {
  console.log('[AlarmScheduler] Testing Notifee fullScreenAction...');

  // Ensure channel exists
  await createAlarmChannel();

  // Schedule for 10 seconds from now
  const triggerTimestamp = Date.now() + 10 * 1000;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTimestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: 'test-fullscreen',
      title: '🧪 TEST: Notifee FullScreen',
      body: 'This notification will trigger in 10 seconds to test AlarmActivity',
      data: {
        alarmId: 'test-notifee-123',
        time: '07:00',
        period: 'AM',
        challenge: 'Test Notifee Challenge',
        challengeIcon: 'calculate',
        type: 'alarm',
      },
      android: {
        channelId: ALARM_CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        showTimestamp: true,
        timestamp: triggerTimestamp,
        fullScreenAction: {
          id: 'alarm-triggered',
          launchActivity: 'com.wgsoftwares.wakemind.MainActivity',
        },
        sound: 'alarm_sound',
        loopSound: false,
        ongoing: false,
        autoCancel: true,
        lightUpScreen: true,
      },
      ios: {
        sound: 'default',
        critical: true,
        criticalVolume: 1.0,
        interruptionLevel: 'critical',
      },
    },
    trigger
  );

  console.log('[AlarmScheduler] Test notification scheduled:', notificationId);
  console.log('[AlarmScheduler] Wait 10 seconds and lock your screen to test...');

  return notificationId;
}

export const AlarmScheduler = {
  initialize: initializeAlarmScheduler,
  checkPermissions,
  requestPermissions,
  openBatteryOptimizationSettings,
  openAlarmPermissionSettings,
  openNotificationSettings,
  openDisplayOverOtherAppsSettings,
  openAutoStartSettings,
  getDeviceManufacturer,
  scheduleAlarm,
  cancelAlarm,
  cancelAllAlarmNotifications,
  rescheduleAlarm,
  cancelAllAlarms,
  getScheduledAlarms,
  snoozeAlarm,
  dismissAlarm,
  scheduleWakeCheck,
  testNotifeeFullScreenIntent,
};
