import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BackupProtocol } from '@/features/alarms/components/backup-protocols-section';
import type { Alarm } from '@/types/alarm';
import type { DifficultyLevel, Period } from '@/types/alarm-enums';
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
    (set) => ({
      alarms: [],
      addAlarm: (alarmInput) =>
        set((state) => ({
          alarms: [
            ...state.alarms,
            {
              // TODO: mOVE TO DAYJS OR UUID
              id: Date.now().toString(),
              time: alarmInput.time,
              period: alarmInput.period,
              challenge: alarmInput.challenge,
              challengeIcon: alarmInput.challengeIcon,
              schedule: alarmInput.schedule,
              isEnabled: true,
            },
          ],
        })),
      updateAlarm: (id, updatedAlarm) =>
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, ...updatedAlarm } : alarm
          ),
        })),
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
