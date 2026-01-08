import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Language, ThemeMode } from '@/types/settings-enums';
import { createMMKVStorage } from '@/utils/storage';

interface SettingsState {
  language: Language;
  theme: ThemeMode;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: Language.EN,
      theme: ThemeMode.SYSTEM,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => createMMKVStorage('settings-storage')),
    }
  )
);
