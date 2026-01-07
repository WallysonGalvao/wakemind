import * as Crypto from 'expo-crypto';
import i18n from 'i18next';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BackupProtocol } from '@/features/alarms/components/backup-protocols-section';
import type { Alarm } from '@/types/alarm';
import type { DifficultyLevel, Period } from '@/types/alarm-enums';
import { sanitizeAlarmInput, validateAlarmInput } from '@/utils/alarm-validation';
import { createMMKVStorage } from '@/utils/storage';

export interface AlarmInput {
  time: string; // "05:30"
  period: Period;
  challenge: string;
  challengeIcon: string;
  schedule: string;
  difficulty?: DifficultyLevel;
  protocols?: BackupProtocol[];
}

interface AlarmsState {
  alarms: Alarm[];
  addAlarm: (alarm: AlarmInput) => void;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
}

export const useAlarmsStore = create<AlarmsState>()(
  persist(
    (set, get) => ({
      alarms: [],
      addAlarm: (alarmInput) => {
        const state = get();

        // Sanitize input
        const sanitizedInput = sanitizeAlarmInput(alarmInput);

        // Validate input
        const validationResult = validateAlarmInput(sanitizedInput, state.alarms);

        if (!validationResult.isValid && validationResult.errorKey) {
          const errorMessage = i18n.t(validationResult.errorKey, validationResult.errorParams);
          throw new Error(errorMessage);
        }

        // Add alarm if validation passes
        set({
          alarms: [
            ...state.alarms,
            {
              id: Crypto.randomUUID(),
              time: sanitizedInput.time,
              period: sanitizedInput.period,
              challenge: sanitizedInput.challenge,
              challengeIcon: sanitizedInput.challengeIcon,
              schedule: sanitizedInput.schedule,
              isEnabled: true,
            },
          ],
        });
      },
      updateAlarm: (id, updatedAlarm) => {
        const state = get();

        // If updating time or period, validate for duplicates
        if (updatedAlarm.time || updatedAlarm.period) {
          const existingAlarm = state.alarms.find((alarm) => alarm.id === id);
          if (!existingAlarm) {
            throw new Error(i18n.t('validation.alarm.notFound'));
          }

          const timeToValidate = updatedAlarm.time || existingAlarm.time;
          const periodToValidate = updatedAlarm.period || existingAlarm.period;

          // Create a temporary input for validation
          const tempInput: AlarmInput = {
            time: timeToValidate,
            period: periodToValidate,
            challenge: updatedAlarm.challenge || existingAlarm.challenge,
            challengeIcon: updatedAlarm.challengeIcon || existingAlarm.challengeIcon,
            schedule: updatedAlarm.schedule || existingAlarm.schedule,
          };

          // Validate with excludeId to allow updating the same alarm
          const validationResult = validateAlarmInput(tempInput, state.alarms, id);

          if (!validationResult.isValid && validationResult.errorKey) {
            const errorMessage = i18n.t(validationResult.errorKey, validationResult.errorParams);
            throw new Error(errorMessage);
          }
        }

        // Update alarm if validation passes
        set({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, ...updatedAlarm } : alarm
          ),
        });
      },
      deleteAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        })),
      toggleAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, isEnabled: !alarm.isEnabled } : alarm
          ),
        })),
    }),
    {
      name: 'alarms-storage',
      storage: createJSONStorage(() => createMMKVStorage('alarms-storage')),
    }
  )
);
