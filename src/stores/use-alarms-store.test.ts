import { act, renderHook } from '@testing-library/react-native';

import type { AlarmInput } from './use-alarms-store';
import { useAlarmsStore } from './use-alarms-store';

import { ChallengeType, Period, Schedule } from '@/types/alarm-enums';

// Mock i18n
jest.mock('i18next', () => ({
  t: (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      'validation.alarm.timeFormat': 'Invalid time format',
      'validation.alarm.periodInvalid': 'Invalid period',
      'validation.alarm.duplicate': `Alarm already exists at ${params?.time} ${params?.period}`,
      'validation.alarm.challengeRequired': 'Challenge is required',
      'validation.alarm.challengeIconRequired': 'Challenge icon is required',
      'validation.alarm.scheduleRequired': 'Schedule is required',
      'validation.alarm.notFound': 'Alarm not found',
    };
    return translations[key] || key;
  },
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
}));

// Mock MMKV storage
jest.mock('@/utils/storage', () => ({
  createMMKVStorage: jest.fn(() => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));

describe('useAlarmsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAlarmsStore());
    act(() => {
      result.current.alarms.forEach((alarm) => {
        result.current.deleteAlarm(alarm.id);
      });
    });
  });

  describe('addAlarm', () => {
    it('should add a valid alarm', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const newAlarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(newAlarm);
      });

      expect(result.current.alarms).toHaveLength(1);
      expect(result.current.alarms[0]).toMatchObject({
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
        isEnabled: true,
      });
      expect(result.current.alarms[0].id).toBeDefined();
    });

    it('should sanitize alarm input before adding', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const newAlarm: AlarmInput = {
        time: '  06:30  ',
        period: Period.AM,
        challenge: '  Math Challenge  ',
        challengeIcon: '  calculate  ',
        schedule: '  Daily  ',
      };

      act(() => {
        result.current.addAlarm(newAlarm);
      });

      expect(result.current.alarms[0].time).toBe('06:30');
      expect(result.current.alarms[0].challenge).toBe('Math Challenge');
      expect(result.current.alarms[0].challengeIcon).toBe('calculate');
      expect(result.current.alarms[0].schedule).toBe('Daily');
    });

    it('should throw error for invalid time format', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const invalidAlarm: AlarmInput = {
        time: '25:00',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      expect(() => {
        act(() => {
          result.current.addAlarm(invalidAlarm);
        });
      }).toThrow('Invalid time format');
    });

    it('should throw error for duplicate alarm time', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const alarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(alarm);
      });

      expect(() => {
        act(() => {
          result.current.addAlarm(alarm);
        });
      }).toThrow('Alarm already exists at 06:30 AM');
    });

    it('should throw error for empty challenge', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const invalidAlarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: '',
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      expect(() => {
        act(() => {
          result.current.addAlarm(invalidAlarm);
        });
      }).toThrow('Challenge is required');
    });

    it('should allow same time with different period', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const alarmAM: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      const alarmPM: AlarmInput = {
        time: '06:30',
        period: Period.PM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(alarmAM);
        result.current.addAlarm(alarmPM);
      });

      expect(result.current.alarms).toHaveLength(2);
    });
  });

  describe('updateAlarm', () => {
    it('should update alarm properties', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const newAlarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(newAlarm);
      });

      const alarmId = result.current.alarms[0].id;

      act(() => {
        result.current.updateAlarm(alarmId, {
          challenge: ChallengeType.MEMORY,
          challengeIcon: 'memory',
        });
      });

      expect(result.current.alarms[0].challenge).toBe(ChallengeType.MEMORY);
      expect(result.current.alarms[0].challengeIcon).toBe('memory');
      expect(result.current.alarms[0].time).toBe('06:30'); // Should not change
    });

    it('should update time and period with validation', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const newAlarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(newAlarm);
      });

      const alarmId = result.current.alarms[0].id;

      act(() => {
        result.current.updateAlarm(alarmId, {
          time: '07:00',
          period: Period.PM,
        });
      });

      expect(result.current.alarms[0].time).toBe('07:00');
      expect(result.current.alarms[0].period).toBe(Period.PM);
    });

    it('should allow updating to same time (excludeId logic)', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const newAlarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(newAlarm);
      });

      const alarmId = result.current.alarms[0].id;

      // Should not throw error when updating same alarm to same time
      expect(() => {
        act(() => {
          result.current.updateAlarm(alarmId, {
            challenge: ChallengeType.LOGIC,
          });
        });
      }).not.toThrow();
    });

    it('should throw error when updating to duplicate time', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const alarm1: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      const alarm2: AlarmInput = {
        time: '07:00',
        period: Period.AM,
        challenge: ChallengeType.MEMORY,
        challengeIcon: 'memory',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(alarm1);
        result.current.addAlarm(alarm2);
      });

      const alarm2Id = result.current.alarms[1].id;

      expect(() => {
        act(() => {
          result.current.updateAlarm(alarm2Id, {
            time: '06:30',
            period: Period.AM,
          });
        });
      }).toThrow('Alarm already exists at 06:30 AM');
    });

    it('should throw error for non-existent alarm when updating time/period', () => {
      const { result } = renderHook(() => useAlarmsStore());

      expect(() => {
        act(() => {
          result.current.updateAlarm('non-existent-id', {
            time: '08:00',
            period: Period.AM,
          });
        });
      }).toThrow('Alarm not found');
    });

    it('should silently ignore update for non-existent alarm when not updating time/period', () => {
      const { result } = renderHook(() => useAlarmsStore());

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.updateAlarm('non-existent-id', {
            challenge: 'Updated',
          });
        });
      }).not.toThrow();

      // No alarms should exist
      expect(result.current.alarms).toHaveLength(0);
    });
  });

  describe('deleteAlarm', () => {
    it('should delete an alarm', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const newAlarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(newAlarm);
      });

      expect(result.current.alarms).toHaveLength(1);

      const alarmId = result.current.alarms[0].id;

      act(() => {
        result.current.deleteAlarm(alarmId);
      });

      expect(result.current.alarms).toHaveLength(0);
    });

    it('should delete correct alarm when multiple exist', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const alarm1: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      const alarm2: AlarmInput = {
        time: '07:00',
        period: Period.AM,
        challenge: ChallengeType.MEMORY,
        challengeIcon: 'memory',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(alarm1);
        result.current.addAlarm(alarm2);
      });

      const alarm1Id = result.current.alarms[0].id;

      act(() => {
        result.current.deleteAlarm(alarm1Id);
      });

      expect(result.current.alarms).toHaveLength(1);
      expect(result.current.alarms[0].challenge).toBe(ChallengeType.MEMORY);
    });
  });

  describe('toggleAlarm', () => {
    it('should toggle alarm enabled state', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const newAlarm: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(newAlarm);
      });

      const alarmId = result.current.alarms[0].id;

      expect(result.current.alarms[0].isEnabled).toBe(true);

      act(() => {
        result.current.toggleAlarm(alarmId);
      });

      expect(result.current.alarms[0].isEnabled).toBe(false);

      act(() => {
        result.current.toggleAlarm(alarmId);
      });

      expect(result.current.alarms[0].isEnabled).toBe(true);
    });

    it('should only toggle the specified alarm', () => {
      const { result } = renderHook(() => useAlarmsStore());

      const alarm1: AlarmInput = {
        time: '06:30',
        period: Period.AM,
        challenge: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: Schedule.DAILY,
      };

      const alarm2: AlarmInput = {
        time: '07:00',
        period: Period.AM,
        challenge: ChallengeType.MEMORY,
        challengeIcon: 'memory',
        schedule: Schedule.DAILY,
      };

      act(() => {
        result.current.addAlarm(alarm1);
        result.current.addAlarm(alarm2);
      });

      const alarm1Id = result.current.alarms[0].id;

      act(() => {
        result.current.toggleAlarm(alarm1Id);
      });

      expect(result.current.alarms[0].isEnabled).toBe(false);
      expect(result.current.alarms[1].isEnabled).toBe(true);
    });
  });
});
