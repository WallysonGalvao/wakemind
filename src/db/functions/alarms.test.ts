// Mock expo-sqlite and drizzle
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
  })),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
          limit: jest.fn(() => Promise.resolve([])),
        })),
        orderBy: jest.fn(() => Promise.resolve([])),
        limit: jest.fn(() => Promise.resolve([])),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => Promise.resolve()),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve()),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve()),
    })),
  })),
}));

import * as alarmsDb from './alarms';

import { ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';

describe('Alarms Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAlarm', () => {
    it('should insert a new alarm into the database', async () => {
      const mockDb = require('@/db').db;
      const mockInsert = jest.fn(() => ({
        values: jest.fn(() => Promise.resolve()),
      }));
      mockDb.insert = mockInsert;

      await alarmsDb.addAlarm('test-id', {
        time: '06:00',
        period: Period.AM,
        challenge: 'Math Challenge',
        challengeType: ChallengeType.MATH,
        challengeIcon: 'calculate',
        schedule: 'Daily',
        difficulty: DifficultyLevel.MEDIUM,
      });

      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('getAlarms', () => {
    it('should return all alarms', async () => {
      const mockDb = require('@/db').db;
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          orderBy: jest.fn(() =>
            Promise.resolve([
              {
                id: '1',
                time: '06:00',
                period: 'AM',
                challenge: 'Math Challenge',
                challengeType: 'math',
                challengeIcon: 'calculate',
                schedule: 'Daily',
                isEnabled: true,
                difficulty: 'medium',
                protocols: null,
              },
            ])
          ),
        })),
      });

      const alarms = await alarmsDb.getAlarms();
      expect(alarms).toHaveLength(1);
      expect(alarms[0].time).toBe('06:00');
    });
  });

  describe('getAlarmById', () => {
    it('should return alarm when found', async () => {
      const mockDb = require('@/db').db;
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() =>
              Promise.resolve([
                {
                  id: 'test-id',
                  time: '06:00',
                  period: 'AM',
                  challenge: 'Math Challenge',
                  challengeType: 'math',
                  challengeIcon: 'calculate',
                  schedule: 'Daily',
                  isEnabled: true,
                  difficulty: 'medium',
                  protocols: null,
                },
              ])
            ),
          })),
        })),
      });

      const alarm = await alarmsDb.getAlarmById('test-id');
      expect(alarm).not.toBeNull();
      expect(alarm?.id).toBe('test-id');
    });

    it('should return null when not found', async () => {
      const mockDb = require('@/db').db;
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
        })),
      });

      const alarm = await alarmsDb.getAlarmById('non-existent');
      expect(alarm).toBeNull();
    });
  });

  describe('updateAlarm', () => {
    it('should update alarm fields', async () => {
      const mockDb = require('@/db').db;
      const mockUpdate = jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      }));
      mockDb.update = mockUpdate;

      await alarmsDb.updateAlarm('test-id', {
        time: '07:00',
        isEnabled: false,
      });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteAlarm', () => {
    it('should delete alarm from database', async () => {
      const mockDb = require('@/db').db;
      const mockDelete = jest.fn(() => ({
        where: jest.fn(() => Promise.resolve()),
      }));
      mockDb.delete = mockDelete;

      await alarmsDb.deleteAlarm('test-id');

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('toggleAlarm', () => {
    it('should toggle alarm enabled state', async () => {
      const mockDb = require('@/db').db;

      // Mock getAlarmById
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() =>
              Promise.resolve([
                {
                  id: 'test-id',
                  time: '06:00',
                  period: 'AM',
                  challenge: 'Math Challenge',
                  challengeType: 'math',
                  challengeIcon: 'calculate',
                  schedule: 'Daily',
                  isEnabled: true,
                  difficulty: 'medium',
                  protocols: null,
                },
              ])
            ),
          })),
        })),
      });

      // Mock updateAlarm
      const mockUpdate = jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      }));
      mockDb.update = mockUpdate;

      const newState = await alarmsDb.toggleAlarm('test-id');

      expect(newState).toBe(false); // Should toggle from true to false
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
