import '../../global.css';

import { useEffect } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
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

export default function RootLayout() {
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

    const initializeServices = async () => {
      try {
        await AlarmScheduler.initialize();
        await NotificationHandler.initialize();

        // Set up callbacks for notification events
        NotificationHandler.setCallbacks({
          getAlarm: getAlarmById,
          onAlarmTriggered: (alarmId) => {
            console.log('[RootLayout] Alarm triggered:', alarmId);
          },
          onSnooze: (alarmId) => {
            console.log('[RootLayout] Alarm snoozed:', alarmId);
          },
          onDismiss: (alarmId) => {
            console.log('[RootLayout] Alarm dismissed:', alarmId);
          },
        });

        // Sync alarms with scheduler on app start
        await syncAlarmsWithScheduler();
      } catch (error) {
        console.error('[RootLayout] Failed to initialize services:', error);
      }
    };

    initializeServices();

    return () => {
      NotificationHandler.cleanup();
    };
  }, [getAlarmById, syncAlarmsWithScheduler]);

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
      <GluestackUIProvider mode={theme}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="alarm/create-alarm" options={{ headerShown: false }} />
            <Stack.Screen
              name="alarm/edit-alarm"
              options={{
                presentation: 'modal',
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
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureHandlerRootView: {
    flex: 1,
  },
});
