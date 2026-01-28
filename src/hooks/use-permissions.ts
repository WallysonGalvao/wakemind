import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

import * as ExpoAlarmActivity from '../../modules/expo-alarm-activity';

import { AlarmScheduler, type PermissionStatus } from '@/services/alarm-scheduler';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    notifications: 'undetermined',
    exactAlarms: 'undetermined',
    fullScreen: 'undetermined',
    batteryOptimization: 'undetermined',
    displayOverOtherApps: 'undetermined',
    autoStart: 'undetermined',
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = async () => {
    setIsLoading(true);
    const status = await AlarmScheduler.checkPermissions();

    // If device doesn't require manufacturer AutoStart, mark as granted
    if (Platform.OS === 'android' && !ExpoAlarmActivity.requiresManufacturerAutoStart()) {
      status.autoStart = 'granted';
    }

    setPermissions(status);
    setIsLoading(false);
    return status;
  };

  const requestNotifications = async () => {
    const granted = await AlarmScheduler.requestPermissions();
    await checkPermissions();
    return granted;
  };

  const requestExactAlarms = async () => {
    if (Platform.OS === 'android') {
      await AlarmScheduler.openAlarmPermissionSettings();
      // Check again after user returns (they'll need to come back manually)
      await checkPermissions();
    }
  };

  const requestBatteryOptimization = async () => {
    if (Platform.OS === 'android') {
      await AlarmScheduler.openBatteryOptimizationSettings();
      await checkPermissions();
    }
  };

  const requestFullScreen = async () => {
    if (Platform.OS === 'android') {
      await AlarmScheduler.openNotificationSettings();
      await checkPermissions();
    }
  };

  const requestDisplayOverOtherApps = async () => {
    if (Platform.OS === 'android') {
      ExpoAlarmActivity.openDisplayOverOtherAppsSettings();
      await checkPermissions();
    }
  };

  const requestAutoStart = async () => {
    if (Platform.OS === 'android') {
      ExpoAlarmActivity.openAutoStartSettings();
      // Note: AutoStart permission cannot be checked programmatically
      // The status remains 'undetermined' - user must verify manually
    }
  };

  const hasAllCriticalPermissions = () => {
    const basePermissions =
      permissions.notifications === 'granted' &&
      permissions.exactAlarms === 'granted' &&
      permissions.displayOverOtherApps === 'granted';

    // AutoStart is only critical if device requires it
    const autoStartOk =
      Platform.OS !== 'android' ||
      !ExpoAlarmActivity.requiresManufacturerAutoStart() ||
      permissions.autoStart === 'granted';

    return basePermissions && autoStartOk;
  };

  const hasOptimalPermissions = () => {
    return (
      hasAllCriticalPermissions() &&
      permissions.batteryOptimization === 'granted' &&
      permissions.fullScreen === 'granted'
    );
  };

  // Check permissions on mount
  useEffect(() => {
    void checkPermissions();
  }, []);

  return {
    permissions,
    isLoading,
    checkPermissions,
    requestNotifications,
    requestExactAlarms,
    requestBatteryOptimization,
    requestFullScreen,
    requestDisplayOverOtherApps,
    requestAutoStart,
    hasAllCriticalPermissions,
    hasOptimalPermissions,
  };
}
