import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_ALARM_TONE_ID } from '@/constants/alarm-tones';
import { Language, ThemeMode, VibrationPattern } from '@/types/settings-enums';
import { createMMKVStorage } from '@/utils/storage';

interface SettingsState {
  language: Language;
  theme: ThemeMode;
  alarmToneId: string;
  alarmVolume: number;
  vibrationPattern: VibrationPattern;
  vibrateOnSuccess: boolean;
  preventAutoLock: boolean;
  snoozeProtection: boolean;
  maxChallengeAttempts: number;
  hasCompletedOnboarding: boolean;
  hasCompletedPermissions: boolean;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  setAlarmToneId: (toneId: string) => void;
  setAlarmVolume: (volume: number) => void;
  setVibrationPattern: (pattern: VibrationPattern) => void;
  setVibrateOnSuccess: (value: boolean) => void;
  setPreventAutoLock: (value: boolean) => void;
  setSnoozeProtection: (value: boolean) => void;
  setMaxChallengeAttempts: (value: number) => void;
  completeOnboarding: () => void;
  completePermissions: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: Language.EN,
      theme: ThemeMode.SYSTEM,
      alarmToneId: DEFAULT_ALARM_TONE_ID,
      alarmVolume: 0.85,
      vibrationPattern: VibrationPattern.MODERATE,
      vibrateOnSuccess: true,
      preventAutoLock: true,
      snoozeProtection: true,
      maxChallengeAttempts: 3,
      hasCompletedOnboarding: false,
      hasCompletedPermissions: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setAlarmToneId: (alarmToneId) => set({ alarmToneId }),
      setAlarmVolume: (alarmVolume) => set({ alarmVolume }),
      setVibrationPattern: (vibrationPattern) => set({ vibrationPattern }),
      setVibrateOnSuccess: (vibrateOnSuccess) => set({ vibrateOnSuccess }),
      setPreventAutoLock: (preventAutoLock) => set({ preventAutoLock }),
      setSnoozeProtection: (snoozeProtection) => set({ snoozeProtection }),
      setMaxChallengeAttempts: (maxChallengeAttempts) => set({ maxChallengeAttempts }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      completePermissions: () => set({ hasCompletedPermissions: true }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => createMMKVStorage('settings-storage')),
    }
  )
);
