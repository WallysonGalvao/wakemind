import { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';

import {
  AlarmScheduler,
  type PermissionStatus,
} from '@/services/alarm-scheduler';

export interface AlarmPermissionsState {
  status: PermissionStatus;
  isLoading: boolean;
  isAllGranted: boolean;
  needsNotificationPermission: boolean;
  needsBatteryOptimization: boolean;
}

export function useAlarmPermissions() {
  const [status, setStatus] = useState<PermissionStatus>({
    notifications: 'undetermined',
    exactAlarms: 'undetermined',
    fullScreen: 'undetermined',
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

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const isAllGranted =
    status.notifications === 'granted' &&
    status.exactAlarms === 'granted' &&
    status.fullScreen === 'granted';

  const needsNotificationPermission = status.notifications !== 'granted';
  const needsBatteryOptimization =
    Platform.OS === 'android' && status.exactAlarms !== 'granted';

  return {
    status,
    isLoading,
    isAllGranted,
    needsNotificationPermission,
    needsBatteryOptimization,
    checkPermissions,
    requestNotificationPermission,
    openBatterySettings,
    openAlarmSettings,
  };
}
