import { useEffect } from 'react';

import notifee from '@notifee/react-native';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';

import type { AlarmNotificationData } from '@/services/notification-handler';
import { useSettingsStore } from '@/stores/use-settings-store';

export default function Index() {
  const router = useRouter();
  const hasCompletedOnboarding = useSettingsStore((state) => state.hasCompletedOnboarding);

  // Check if app was opened by a notification and navigate accordingly
  useEffect(() => {
    const checkAndNavigate = async () => {
      try {
        const initialEvent = await notifee.getInitialNotification();

        if (initialEvent?.notification?.data) {
          const data = initialEvent.notification.data as unknown as AlarmNotificationData;

          // If it's an alarm notification, navigate to trigger screen
          if (data.alarmId) {
            console.log('[Index] App opened by alarm notification:', data.alarmId);

            const { alarmId, time, period, challenge, challengeIcon, type } = data;

            const url = `/alarm/trigger?alarmId=${alarmId}&time=${time || '00:00'}&period=${
              period || 'AM'
            }&challenge=${encodeURIComponent(
              challenge || 'Challenge'
            )}&challengeIcon=${challengeIcon || 'calculate'}&type=${type || 'alarm'}`;

            console.log('[Index] Redirecting to alarm trigger:', url);

            router.replace(url as Href);
            return;
          }
        }

        // No notification, navigate based on onboarding status
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('[Index] Error checking initial notification:', error);
        // On error, fallback to normal navigation
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      }
    };

    checkAndNavigate();
  }, [router, hasCompletedOnboarding]);

  // Show nothing while checking
  return null;
}
