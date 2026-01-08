import '../../global.css';

import { useEffect } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { StyleSheet } from 'react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useTheme } from '@/hooks/use-theme';
import '@/i18n';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const theme = useTheme();
  const isDark = theme === 'dark';

  const [fontsLoaded] = useFonts({
    MaterialSymbolsRoundedFilled: require('@/assets/fonts/MaterialSymbolsRounded-Filled.ttf'),
  });

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
