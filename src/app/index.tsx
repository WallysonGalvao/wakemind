import { useEffect, useState } from 'react';

import notifee from '@notifee/react-native';
import type { Href } from 'expo-router';
import { Redirect, useRouter } from 'expo-router';

import type { AlarmNotificationData } from '@/services/notification-handler';
import { useSettingsStore } from '@/stores/use-settings-store';

export default function Index() {
  const router = useRouter();
  const hasCompletedOnboarding = useSettingsStore((state) => state.hasCompletedOnboarding);
  const [isChecking, setIsChecking] = useState(true);

  // Check if app was opened by a notification
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

            const url = `/alarm/trigger?alarmId=${alarmId}&time=${time || '00:00'}&period=${period || 'AM'}&challenge=${encodeURIComponent(challenge || 'Challenge')}&challengeIcon=${challengeIcon || 'calculate'}&type=${type || 'alarm'}`;

            console.log('[Index] Redirecting to alarm trigger:', url);

            // Use replace to avoid going back to index
            setTimeout(() => {
              router.replace(url as Href);
            }, 100);

            setIsChecking(false);
            return;
          }
        }

        setIsChecking(false);
      } catch (error) {
        console.error('[Index] Error checking initial notification:', error);
        setIsChecking(false);
      }
    };

    checkAndNavigate();
  }, [router]);

  // Don't render redirects until we've checked for initial notification
  if (isChecking) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
