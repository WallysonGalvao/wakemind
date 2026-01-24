import React, { useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Platform, ScrollView, Text, View } from 'react-native';

import { PermissionCard } from '@/components/permissions/permission-card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { AlarmScheduler } from '@/services/alarm-scheduler';
import { useSettingsStore } from '@/stores/use-settings-store';

const TOTAL_STEPS = Platform.OS === 'ios' ? 2 : 6;

export default function PermissionsOnboardingScreen() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [manufacturer, setManufacturer] = useState<string>('');
  const {
    permissions,
    requestNotifications,
    requestExactAlarms,
    requestBatteryOptimization,
    requestDisplayOverOtherApps,
    requestAutoStart,
  } = usePermissions();
  const completePermissions = useSettingsStore((state) => state.completePermissions);

  // Get device manufacturer on mount
  React.useEffect(() => {
    const getManufacturer = async () => {
      const mfr = await AlarmScheduler.getDeviceManufacturer();
      setManufacturer(mfr.toLowerCase());
    };
    void getManufacturer();
  }, []);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark permissions as completed and navigate to main app
      completePermissions();
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    setCurrentStep(currentStep + 1);
  };

  const renderStep = () => {
    // iOS steps
    if (Platform.OS === 'ios') {
      switch (currentStep) {
        case 0:
          return (
            <PermissionCard
              icon={
                <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
                  <Ionicons name="alarm" size={32} color="white" />
                </View>
              }
              title={t('permissions.notifications.ios.title', { appName: 'WakeMind' })}
              description={t('permissions.notifications.ios.description')}
              additionalInfo={t('permissions.notifications.ios.additionalInfo')}
              onAllow={async () => {
                await requestNotifications();
                handleNext();
              }}
              onDeny={handleSkip}
              allowText={t('permissions.buttons.allow')}
              denyText={t('permissions.buttons.dontAllow')}
            />
          );

        case 1:
          return (
            <PermissionCard
              icon={
                <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-red-500">
                  <Ionicons name="notifications" size={32} color="white" />
                </View>
              }
              title={t('permissions.notifications.general.title', { appName: 'WakeMind' })}
              description={t('permissions.notifications.general.description')}
              onAllow={async () => {
                if (permissions.notifications !== 'granted') {
                  await requestNotifications();
                }
                handleNext();
              }}
              onDeny={handleSkip}
              allowText={t('permissions.buttons.allow')}
              denyText={t('permissions.buttons.dontAllow')}
            />
          );

        default:
          return null;
      }
    }

    // Android steps
    switch (currentStep) {
      case 0:
        return (
          <PermissionCard
            icon={
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
                <Ionicons name="notifications" size={32} color="white" />
              </View>
            }
            title={t('permissions.notifications.android.title', { appName: 'WakeMind' })}
            description={t('permissions.notifications.android.description')}
            additionalInfo={t('permissions.notifications.android.additionalInfo')}
            onAllow={async () => {
              await requestNotifications();
              handleNext();
            }}
            onDeny={handleSkip}
            allowText={t('permissions.buttons.allow')}
            denyText={t('permissions.buttons.dontAllow')}
          />
        );

      case 1:
        return (
          <PermissionCard
            icon={
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-red-500">
                <Ionicons name="rocket" size={32} color="white" />
              </View>
            }
            title={t('permissions.autoStart.title')}
            description={t('permissions.autoStart.description', { manufacturer })}
            additionalInfo={t('permissions.autoStart.additionalInfo')}
            onAllow={async () => {
              await requestAutoStart();
              handleNext();
            }}
            onDeny={handleSkip}
            allowText={t('permissions.autoStart.buttonAllow')}
            denyText={t('permissions.autoStart.buttonDeny')}
          />
        );

      case 2:
        return (
          <PermissionCard
            icon={
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-purple-500">
                <Ionicons name="apps" size={32} color="white" />
              </View>
            }
            title={t('permissions.displayOverOtherApps.title')}
            description={t('permissions.displayOverOtherApps.description')}
            additionalInfo={t('permissions.displayOverOtherApps.additionalInfo')}
            onAllow={async () => {
              await requestDisplayOverOtherApps();
              handleNext();
            }}
            onDeny={handleSkip}
            allowText={t('permissions.displayOverOtherApps.buttonAllow')}
            denyText={t('permissions.displayOverOtherApps.buttonDeny')}
          />
        );

      case 3:
        return (
          <PermissionCard
            icon={
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-blue-500">
                <Ionicons name="alarm" size={32} color="white" />
              </View>
            }
            title={t('permissions.exactAlarms.title')}
            description={t('permissions.exactAlarms.description')}
            additionalInfo={t('permissions.exactAlarms.additionalInfo')}
            onAllow={async () => {
              await requestExactAlarms();
              handleNext();
            }}
            onDeny={handleSkip}
            allowText={t('permissions.buttons.allow')}
            denyText={t('permissions.buttons.dontAllow')}
          />
        );

      case 4:
        return (
          <PermissionCard
            icon={
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
                <Ionicons name="battery-charging" size={32} color="white" />
              </View>
            }
            title={t('permissions.batteryOptimization.title')}
            description={t('permissions.batteryOptimization.description', { appName: 'WakeMind' })}
            additionalInfo={t('permissions.batteryOptimization.additionalInfo')}
            onAllow={async () => {
              await requestBatteryOptimization();
              handleNext();
            }}
            onDeny={handleSkip}
            allowText={t('permissions.batteryOptimization.buttonAllow')}
            denyText={t('permissions.batteryOptimization.buttonDeny')}
          />
        );

      case 5:
        return (
          <View className="mx-6">
            <View className="mb-8 items-center">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-green-500">
                <Ionicons name="checkmark" size={48} color="white" />
              </View>
              <Text className="mb-3 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {t('permissions.summary.title')}
              </Text>
              <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
                {t('permissions.summary.description')}
              </Text>
            </View>

            <View className="mb-6 rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
              <View className="mb-3 flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                  <Ionicons name="alarm" size={20} color="white" />
                </View>
                <Text className="flex-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
                  {t('permissions.summary.alarmsLabel', {
                    platform: 'Android',
                    version: Platform.Version,
                  })}
                </Text>
                <Ionicons
                  name={permissions.exactAlarms === 'granted' ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={permissions.exactAlarms === 'granted' ? '#22c55e' : '#f59e0b'}
                />
              </View>

              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-500">
                  <Ionicons name="notifications" size={20} color="white" />
                </View>
                <Text className="flex-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
                  {t('permissions.summary.notificationsLabel')}
                </Text>
                <Ionicons
                  name={
                    permissions.notifications === 'granted' ? 'checkmark-circle' : 'alert-circle'
                  }
                  size={24}
                  color={permissions.notifications === 'granted' ? '#22c55e' : '#f59e0b'}
                />
              </View>
            </View>

            <Button onPress={handleNext} className="bg-red-500">
              <Text className="text-base font-semibold text-white">
                {t('permissions.buttons.next')}
              </Text>
            </Button>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView contentContainerClassName="flex-1" showsVerticalScrollIndicator={false}>
        {/* Progress indicator */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <View
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-red-500' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              />
            ))}
          </View>
          <Text className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {t('permissions.progressLabel', { current: currentStep + 1, total: TOTAL_STEPS })}
          </Text>
        </View>

        {/* Title */}
        <View className="px-6 py-8">
          <Text className="text-center text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('permissions.title')}
          </Text>
        </View>

        {/* Permission card */}
        <View className="flex-1 justify-center pb-8">{renderStep()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
