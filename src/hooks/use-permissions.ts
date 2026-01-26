import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

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
      await AlarmScheduler.openDisplayOverOtherAppsSettings();
      await checkPermissions();
    }
  };

  const requestAutoStart = async () => {
    if (Platform.OS === 'android') {
      await AlarmScheduler.openAutoStartSettings();
      // AutoStart permission cannot be checked programmatically
      // Just mark as handled in the UI
      setPermissions((prev) => ({
        ...prev,
        autoStart: 'granted', // Assume user enabled it
      }));
    }
  };

  const hasAllCriticalPermissions = () => {
    return (
      permissions.notifications === 'granted' &&
      permissions.exactAlarms === 'granted' &&
      permissions.displayOverOtherApps === 'granted' &&
      permissions.autoStart === 'granted'
    );
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
