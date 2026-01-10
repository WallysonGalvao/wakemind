import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_ALARM_TONE_ID } from '@/constants/alarm-tones';
import { Language, ThemeMode, VibrationPattern } from '@/types/settings-enums';
import { createMMKVStorage } from '@/utils/storage';

interface SettingsState {
  language: Language;
  theme: ThemeMode;
  alarmToneId: string;
  vibrationPattern: VibrationPattern;
  vibrateOnSuccess: boolean;
  preventAutoLock: boolean;
  snoozeProtection: boolean;
  hasCompletedOnboarding: boolean;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  setAlarmToneId: (toneId: string) => void;
  setVibrationPattern: (pattern: VibrationPattern) => void;
  setVibrateOnSuccess: (value: boolean) => void;
  setPreventAutoLock: (value: boolean) => void;
  setSnoozeProtection: (value: boolean) => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: Language.EN,
      theme: ThemeMode.SYSTEM,
      alarmToneId: DEFAULT_ALARM_TONE_ID,
      vibrationPattern: VibrationPattern.MODERATE,
      vibrateOnSuccess: true,
      preventAutoLock: true,
      snoozeProtection: true,
      hasCompletedOnboarding: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setAlarmToneId: (alarmToneId) => set({ alarmToneId }),
      setVibrationPattern: (vibrationPattern) => set({ vibrationPattern }),
      setVibrateOnSuccess: (vibrateOnSuccess) => set({ vibrateOnSuccess }),
      setPreventAutoLock: (preventAutoLock) => set({ preventAutoLock }),
      setSnoozeProtection: (snoozeProtection) => set({ snoozeProtection }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => createMMKVStorage('settings-storage')),
    }
  )
);
