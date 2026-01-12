import * as Crypto from 'expo-crypto';
import i18n from 'i18next';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Platform } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import type { BackupProtocol } from '@/features/alarms/components/backup-protocols-section';
import { AlarmScheduler } from '@/services/alarm-scheduler';
import type { Alarm } from '@/types/alarm';
import type { ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';
import { sortAlarmsByTime } from '@/utils/alarm-sorting';
import { sanitizeAlarmInput, validateAlarmInput } from '@/utils/alarm-validation';
import { createMMKVStorage } from '@/utils/storage';

export interface AlarmInput {
  time: string; // "05:30"
  period: Period;
  challenge: string;
  challengeType: ChallengeType;
  challengeIcon: string;
  schedule: string;
  difficulty?: DifficultyLevel;
  protocols?: BackupProtocol[];
}

interface AlarmsState {
  alarms: Alarm[];
  addAlarm: (alarm: AlarmInput) => Promise<void>;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  getSortedAlarms: () => Alarm[];
  getAlarmById: (id: string) => Alarm | undefined;
  syncAlarmsWithScheduler: () => Promise<void>;
}

const isNativePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

export const useAlarmsStore = create<AlarmsState>()(
  persist(
    (set, get) => ({
      alarms: [],
      getSortedAlarms: () => sortAlarmsByTime(get().alarms),
      getAlarmById: (id) => get().alarms.find((alarm) => alarm.id === id),

      addAlarm: async (alarmInput) => {
        const state = get();

        // Sanitize input
        const sanitizedInput = sanitizeAlarmInput(alarmInput);

        // Validate input
        const validationResult = validateAlarmInput(sanitizedInput, state.alarms);

        if (!validationResult.isValid && validationResult.errorKey) {
          const errorMessage = i18n.t(validationResult.errorKey, validationResult.errorParams);
          throw new Error(errorMessage);
        }

        const newAlarm: Alarm = {
          id: Crypto.randomUUID(),
          time: sanitizedInput.time,
          period: sanitizedInput.period,
          challenge: sanitizedInput.challenge,
          challengeType: sanitizedInput.challengeType,
          challengeIcon: sanitizedInput.challengeIcon,
          schedule: sanitizedInput.schedule,
          isEnabled: true,
          difficulty: sanitizedInput.difficulty,
          protocols: sanitizedInput.protocols,
        };

        // Schedule notification on native platforms
        if (isNativePlatform) {
          try {
            await AlarmScheduler.scheduleAlarm(newAlarm);
          } catch (error) {
            console.error('[AlarmsStore] Failed to schedule alarm:', error);
          }
        }

        // Track alarm creation
        AnalyticsEvents.alarmCreated(newAlarm.id, newAlarm.time, newAlarm.challengeType);

        // Add alarm to state
        set({
          alarms: [...state.alarms, newAlarm],
        });
      },

      updateAlarm: async (id, updatedAlarm) => {
        const state = get();
        const existingAlarm = state.alarms.find((alarm) => alarm.id === id);

        if (!existingAlarm) {
          throw new Error(i18n.t('validation.alarm.notFound'));
        }

        // If updating time or period, validate for duplicates
        if (updatedAlarm.time || updatedAlarm.period) {
          const timeToValidate = updatedAlarm.time || existingAlarm.time;
          const periodToValidate = updatedAlarm.period || existingAlarm.period;

          // Create a temporary input for validation
          const tempInput: AlarmInput = {
            time: timeToValidate,
            period: periodToValidate,
            challenge: updatedAlarm.challenge || existingAlarm.challenge,
            challengeIcon: updatedAlarm.challengeIcon || existingAlarm.challengeIcon,
            challengeType: updatedAlarm.challengeType || existingAlarm.challengeType,
            schedule: updatedAlarm.schedule || existingAlarm.schedule,
          };

          // Validate with excludeId to allow updating the same alarm
          const validationResult = validateAlarmInput(tempInput, state.alarms, id);

          if (!validationResult.isValid && validationResult.errorKey) {
            const errorMessage = i18n.t(validationResult.errorKey, validationResult.errorParams);
            throw new Error(errorMessage);
          }
        }

        const mergedAlarm: Alarm = { ...existingAlarm, ...updatedAlarm };

        // Reschedule notification if alarm is enabled and time/schedule changed
        if (isNativePlatform && mergedAlarm.isEnabled) {
          const needsReschedule =
            updatedAlarm.time !== undefined ||
            updatedAlarm.period !== undefined ||
            updatedAlarm.schedule !== undefined;

          if (needsReschedule) {
            try {
              await AlarmScheduler.rescheduleAlarm(mergedAlarm);
            } catch (error) {
              console.error('[AlarmsStore] Failed to reschedule alarm:', error);
            }
          }
        }

        // Track alarm update
        AnalyticsEvents.alarmUpdated(id);

        // Update alarm in state
        set({
          alarms: state.alarms.map((alarm) => (alarm.id === id ? mergedAlarm : alarm)),
        });
      },

      deleteAlarm: async (id) => {
        // Cancel notification on native platforms
        if (isNativePlatform) {
          try {
            await AlarmScheduler.cancelAlarm(id);
          } catch (error) {
            console.error('[AlarmsStore] Failed to cancel alarm:', error);
          }
        }

        // Track alarm deletion
        AnalyticsEvents.alarmDeleted(id);

        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        }));
      },

      toggleAlarm: async (id) => {
        const state = get();
        const alarm = state.alarms.find((a) => a.id === id);

        if (!alarm) return;

        const newEnabledState = !alarm.isEnabled;

        // Schedule or cancel based on new state
        if (isNativePlatform) {
          try {
            if (newEnabledState) {
              await AlarmScheduler.scheduleAlarm({ ...alarm, isEnabled: true });
            } else {
              await AlarmScheduler.cancelAlarm(id);
            }
          } catch (error) {
            console.error('[AlarmsStore] Failed to toggle alarm schedule:', error);
          }
        }

        // Track alarm toggle
        AnalyticsEvents.alarmToggled(id, newEnabledState);

        set({
          alarms: state.alarms.map((a) => (a.id === id ? { ...a, isEnabled: newEnabledState } : a)),
        });
      },

      syncAlarmsWithScheduler: async () => {
        if (!isNativePlatform) return;

        const state = get();
        const enabledAlarms = state.alarms.filter((alarm) => alarm.isEnabled);

        // Cancel all existing scheduled alarms
        await AlarmScheduler.cancelAllAlarms();

        // Reschedule all enabled alarms
        for (const alarm of enabledAlarms) {
          try {
            await AlarmScheduler.scheduleAlarm(alarm);
          } catch (error) {
            console.error(`[AlarmsStore] Failed to sync alarm ${alarm.id}:`, error);
          }
        }

        console.log(`[AlarmsStore] Synced ${enabledAlarms.length} alarms with scheduler`);
      },
    }),
    {
      name: 'alarms-storage',
      storage: createJSONStorage(() => createMMKVStorage('alarms-storage')),
    }
  )
);
