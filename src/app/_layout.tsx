import '../../global.css';
import '../analytics';
import '../configs';

import { useEffect } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { HapticsProvider } from 'react-native-custom-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Platform, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useTheme } from '@/hooks/use-theme';
import '@/i18n';
import { AlarmScheduler } from '@/services/alarm-scheduler';
import { NotificationHandler } from '@/services/notification-handler';
import { useAlarmsStore } from '@/stores/use-alarms-store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const getAlarmById = useAlarmsStore((state) => state.getAlarmById);
  const syncAlarmsWithScheduler = useAlarmsStore((state) => state.syncAlarmsWithScheduler);

  const [fontsLoaded] = useFonts({
    MaterialSymbolsRoundedFilled: require('@/assets/fonts/MaterialSymbolsRounded-Filled.ttf'),
  });

  // Initialize notification services on native platforms
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!fontsLoaded) return; // Wait for fonts to load before initializing

    let isMounted = true;

    const initializeServices = async () => {
      try {
        if (!isMounted) return;
        await AlarmScheduler.initialize();

        if (!isMounted) return;
        await NotificationHandler.initialize();

        if (!isMounted) return;
        // Set up callbacks for notification events
        NotificationHandler.setCallbacks({
          getAlarm: getAlarmById,
          onAlarmTriggered: (_alarmId) => {},
          onSnooze: (_alarmId) => {},
          onDismiss: (_alarmId) => {},
        });

        if (!isMounted) return;
        // Sync alarms with scheduler on app start
        await syncAlarmsWithScheduler();
      } catch (error) {
        if (isMounted) {
          Sentry.captureException(error);
        }
      }
    };

    initializeServices();

    return () => {
      isMounted = false;
      NotificationHandler.cleanup();
    };
  }, [getAlarmById, syncAlarmsWithScheduler, fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.gestureHandlerRootView}>
      <HapticsProvider>
        <GluestackUIProvider mode={theme}>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{
                  headerShown: false,
                  animation: 'fade',
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="alarm/create-alarm" options={{ headerShown: false }} />
              <Stack.Screen
                name="alarm/edit-alarm"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="alarm/backup-protocols-info"
                options={{
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="alarm/trigger"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="alarm/performance-summary"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="settings/alarm-tone"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="settings/language"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="settings/vibration-pattern"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="settings/privacy-policy"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="settings/support"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                }}
              />
            </Stack>
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </ThemeProvider>
        </GluestackUIProvider>
      </HapticsProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  gestureHandlerRootView: {
    flex: 1,
  },
});
