import { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { AlarmScheduler, type PermissionStatus } from '@/services/alarm-scheduler';

export interface AlarmPermissionsState {
  status: PermissionStatus;
  isLoading: boolean;
  isAllGranted: boolean;
  needsNotificationPermission: boolean;
  needsExactAlarmPermission: boolean;
}

export function useAlarmPermissions() {
  const [status, setStatus] = useState<PermissionStatus>({
    notifications: 'undetermined',
    exactAlarms: 'undetermined',
    fullScreen: 'undetermined',
    batteryOptimization: 'undetermined',
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const permissionStatus = await AlarmScheduler.checkPermissions();
      setStatus(permissionStatus);
    } catch (error) {
      console.error('[useAlarmPermissions] Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await AlarmScheduler.requestPermissions();
      await checkPermissions();
      return granted;
    } catch (error) {
      console.error('[useAlarmPermissions] Error requesting notification permission:', error);
      return false;
    }
  }, [checkPermissions]);

  const openBatterySettings = useCallback(async () => {
    if (Platform.OS === 'android') {
      await AlarmScheduler.openBatteryOptimizationSettings();
    }
  }, []);

  const openAlarmSettings = useCallback(async () => {
    if (Platform.OS === 'android') {
      await AlarmScheduler.openAlarmPermissionSettings();
    }
  }, []);

  const openNotificationSettings = useCallback(async () => {
    if (Platform.OS === 'android') {
      await AlarmScheduler.openNotificationSettings();
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const isAllGranted =
    status.notifications === 'granted' &&
    status.exactAlarms === 'granted' &&
    status.fullScreen === 'granted' &&
    status.batteryOptimization === 'granted';

  const needsNotificationPermission = status.notifications !== 'granted';
  const needsExactAlarmPermission = Platform.OS === 'android' && status.exactAlarms !== 'granted';
  const needsBatteryOptimizationPermission =
    Platform.OS === 'android' && status.batteryOptimization !== 'granted';

  return {
    status,
    isLoading,
    isAllGranted,
    needsNotificationPermission,
    needsExactAlarmPermission,
    needsBatteryOptimizationPermission,
    checkPermissions,
    requestNotificationPermission,
    openBatterySettings,
    openAlarmSettings,
    openNotificationSettings,
  };
}
