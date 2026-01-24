import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { AlarmScheduler, type PermissionStatus } from '@/services/alarm-scheduler';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    notifications: 'undetermined',
    exactAlarms: 'undetermined',
    fullScreen: 'undetermined',
    batteryOptimization: 'undetermined',
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

  const hasAllCriticalPermissions = () => {
    return permissions.notifications === 'granted' && permissions.exactAlarms === 'granted';
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
    hasAllCriticalPermissions,
    hasOptimalPermissions,
  };
}
