import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createMMKVStorage } from '@/utils/storage';

type SupportedLanguage = 'en' | 'pt' | 'pt-BR' | 'es';
type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  language: SupportedLanguage;
  theme: ThemeMode;
  setLanguage: (language: SupportedLanguage) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'system',
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => createMMKVStorage('settings-storage')),
    }
  )
);
