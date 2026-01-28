import { useEffect, useMemo, useRef, useState } from 'react';

import { AppState, Platform } from 'react-native';

import * as ExpoAlarmActivity from '../../modules/expo-alarm-activity';

import { AnalyticsEvents } from '@/analytics';
import { useAlarmPermissions } from '@/hooks/use-alarm-permissions';

export enum PermissionStep {
  MANUFACTURER_AUTOSTART = 'manufacturer_autostart',
  SYSTEM_ALERT_WINDOW = 'system_alert_window',
  BATTERY_OPTIMIZATION = 'battery_optimization',
}

interface StepContent {
  stepNumber: number;
  totalSteps: number;
  titleKey: string;
  descriptionKey: string;
  toggleLabel: string;
}

interface UseAlarmPermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function useAlarmPermissionsModal({
  visible,
  onClose,
  onComplete,
}: UseAlarmPermissionsModalProps) {
  const {
    openDisplayOverOtherAppsSettings,
    openAutoStartSettings,
    openBatterySettings,
    status,
    checkPermissions,
  } = useAlarmPermissions();

  // Check if device requires manufacturer AutoStart permission
  const requiresAutoStart = useMemo(() => {
    if (Platform.OS === 'android') {
      try {
        return ExpoAlarmActivity.requiresManufacturerAutoStart();
      } catch (error) {
        console.error('Error checking manufacturer AutoStart requirement:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Determine initial step based on device type
  const getInitialStep = () => {
    return requiresAutoStart
      ? PermissionStep.MANUFACTURER_AUTOSTART
      : PermissionStep.SYSTEM_ALERT_WINDOW;
  };

  const [currentStep, setCurrentStep] = useState<PermissionStep>(getInitialStep());
  const [isLoading, setIsLoading] = useState(false);
  const appState = useRef(AppState.currentState);
  const permissionBeforeSettings = useRef<string | null>(null);
  const previousVisible = useRef(visible);

  // Track modal shown when it first becomes visible
  useEffect(() => {
    if (visible && !previousVisible.current) {
      AnalyticsEvents.permissionModalShown('first_alarm');

      const initialStep = getInitialStep();
      if (initialStep === PermissionStep.SYSTEM_ALERT_WINDOW) {
        AnalyticsEvents.permissionStepViewed('system_alert_window', 1);
      } else {
        AnalyticsEvents.permissionStepViewed('manufacturer_autostart', 1);
      }
    }

    previousVisible.current = visible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Listen to app state to check permissions when user returns from settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        permissionBeforeSettings.current &&
        visible
      ) {
        // User returned to app, check if permission was granted
        await checkPermissions();

        const permission = permissionBeforeSettings.current;
        let wasGranted = false;

        if (permission === 'manufacturer_autostart') {
          // AutoStart não pode ser verificado programaticamente em dispositivos com restrições
          wasGranted = true; // Assume que foi concedido
        } else if (permission === 'system_alert_window') {
          wasGranted = status.displayOverOtherApps === 'granted';
        } else if (permission === 'battery_optimization') {
          wasGranted = status.batteryOptimization === 'granted' || status.autoStart === 'granted';
        }

        if (!wasGranted) {
          AnalyticsEvents.permissionDenied(permission);
        }

        permissionBeforeSettings.current = null;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [visible, status, checkPermissions]);

  const handleNext = async () => {
    if (currentStep === PermissionStep.MANUFACTURER_AUTOSTART) {
      setIsLoading(true);
      try {
        permissionBeforeSettings.current = 'manufacturer_autostart';
        await openAutoStartSettings();
        // Will check permission status when user returns (via AppState listener)
        setCurrentStep(PermissionStep.SYSTEM_ALERT_WINDOW);
        AnalyticsEvents.permissionStepViewed('system_alert_window', 2);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === PermissionStep.SYSTEM_ALERT_WINDOW) {
      setIsLoading(true);
      try {
        permissionBeforeSettings.current = 'system_alert_window';
        await openDisplayOverOtherAppsSettings();
        // Will check permission status when user returns (via AppState listener)
        setCurrentStep(PermissionStep.BATTERY_OPTIMIZATION);
        const stepNumber = requiresAutoStart ? 3 : 2;
        AnalyticsEvents.permissionStepViewed('battery_optimization', stepNumber);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === PermissionStep.BATTERY_OPTIMIZATION) {
      setIsLoading(true);
      try {
        permissionBeforeSettings.current = 'battery_optimization';
        await openBatterySettings();
        // Will check permission status when user returns (via AppState listener)

        // Count granted permissions
        let grantedCount = 0;
        if (status.displayOverOtherApps === 'granted') grantedCount++;
        if (status.batteryOptimization === 'granted' || status.autoStart === 'granted')
          grantedCount++;

        const totalSteps = requiresAutoStart ? 3 : 2;
        AnalyticsEvents.permissionFlowCompleted(grantedCount, totalSteps);
        onComplete();
        handleClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSkip = () => {
    let step = 'battery_optimization';
    if (currentStep === PermissionStep.MANUFACTURER_AUTOSTART) step = 'manufacturer_autostart';
    else if (currentStep === PermissionStep.SYSTEM_ALERT_WINDOW) step = 'system_alert_window';

    AnalyticsEvents.permissionSkipped(step);
    const totalSteps = requiresAutoStart ? 3 : 2;
    AnalyticsEvents.permissionFlowCompleted(0, totalSteps);
    onComplete();
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(getInitialStep());
    onClose();
  };

  // Get step content data
  const getStepContent = (): StepContent => {
    let stepNumber = 1;
    let titleKey = 'permissions.alarmPermissions.systemAlertWindow.title';
    let descriptionKey = 'permissions.alarmPermissions.systemAlertWindow.description';
    let toggleLabel = 'permissions.alarmPermissions.illustration.displayOver';

    if (currentStep === PermissionStep.MANUFACTURER_AUTOSTART) {
      stepNumber = 1;
      titleKey = 'permissions.alarmPermissions.manufacturerAutoStart.title';
      descriptionKey = 'permissions.alarmPermissions.manufacturerAutoStart.description';
      toggleLabel = 'AutoStart';
    } else if (currentStep === PermissionStep.SYSTEM_ALERT_WINDOW) {
      stepNumber = requiresAutoStart ? 2 : 1;
      titleKey = 'permissions.alarmPermissions.systemAlertWindow.title';
      descriptionKey = 'permissions.alarmPermissions.systemAlertWindow.description';
      toggleLabel = 'permissions.alarmPermissions.illustration.displayOver';
    } else if (currentStep === PermissionStep.BATTERY_OPTIMIZATION) {
      stepNumber = requiresAutoStart ? 3 : 2;
      titleKey = 'permissions.alarmPermissions.batteryOptimization.title';
      descriptionKey = 'permissions.alarmPermissions.batteryOptimization.description';
      toggleLabel = 'permissions.alarmPermissions.illustration.autoStart';
    }

    const totalSteps = requiresAutoStart ? 3 : 2;

    return {
      stepNumber,
      totalSteps,
      titleKey,
      descriptionKey,
      toggleLabel,
    };
  };

  return {
    currentStep,
    isLoading,
    requiresAutoStart,
    stepContent: getStepContent(),
    handleNext,
    handleSkip,
    handleClose,
  };
}
