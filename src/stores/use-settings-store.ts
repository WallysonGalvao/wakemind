import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_ALARM_TONE_ID } from '@/constants/alarm-tones';
import { Language, ThemeMode } from '@/types/settings-enums';
import { createMMKVStorage } from '@/utils/storage';

interface SettingsState {
  language: Language;
  theme: ThemeMode;
  alarmToneId: string;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  setAlarmToneId: (toneId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: Language.EN,
      theme: ThemeMode.SYSTEM,
      alarmToneId: DEFAULT_ALARM_TONE_ID,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setAlarmToneId: (alarmToneId) => set({ alarmToneId }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => createMMKVStorage('settings-storage')),
    }
  )
);
