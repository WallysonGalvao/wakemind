import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/use-settings-store';
import { ThemeMode } from '@/types/settings-enums';

/**
 * Hook to get the current color scheme based on user preference and system setting.
 * This replaces the default React Native useColorScheme to respect app settings.
 * @returns The current color scheme ('light' | 'dark')
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemColorScheme = useSystemColorScheme();
  const themeMode = useSettingsStore((state) => state.theme);

  if (themeMode === ThemeMode.SYSTEM) {
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }

  return themeMode === ThemeMode.DARK ? 'dark' : 'light';
}
