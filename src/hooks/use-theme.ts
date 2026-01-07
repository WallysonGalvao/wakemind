import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/use-settings-store';

export type ColorScheme = 'light' | 'dark';

/**
 * Hook to get the current theme based on user preference and system setting
 * @returns The current color scheme ('light' or 'dark')
 */
export const useTheme = (): ColorScheme => {
  const systemColorScheme = useSystemColorScheme();
  const themeMode = useSettingsStore((state) => state.theme);

  if (themeMode === 'system') {
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }

  return themeMode;
};

/**
 * Hook to check if dark mode is active
 */
export const useIsDarkMode = (): boolean => {
  const theme = useTheme();
  return theme === 'dark';
};
