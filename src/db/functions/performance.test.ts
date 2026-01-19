import dayjs from 'dayjs';

// Mock expo-sqlite and drizzle before importing the service
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
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => Promise.resolve()),
    })),
    delete: jest.fn(() => ({
      from: jest.fn(() => Promise.resolve()),
    })),
  })),
}));

import * as performanceService from './performance';

describe('Performance Service - Dynamic Gains', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStreakGain', () => {
    it('should return 1 for first completion', async () => {
      // Mock database to return one completion today
      const mockDb = require('@/db').db;
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    id: 1,
                    date: dayjs().format('YYYY-MM-DD'),
                    cognitiveScore: 80,
                    reactionTime: 250,
                  },
                ])
              ),
            })),
          })),
        })),
      });

      const streakGain = await performanceService.getStreakGain();
      expect(streakGain).toBe(1);
    });

    it('should return 0 if not completed today', async () => {
      // Mock database to return only yesterday's completion
      const mockDb = require('@/db').db;
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    id: 1,
                    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                    cognitiveScore: 75,
                    reactionTime: 300,
                  },
                ])
              ),
            })),
          })),
        })),
      });

      const streakGain = await performanceService.getStreakGain();
      expect(streakGain).toBe(0);
    });
  });

  describe('getScoreGain', () => {
    it('should calculate positive gain when today score is higher than average', async () => {
      // Mock database to return completions with increasing scores
      const mockDb = require('@/db').db;

      // Mock getAverageCognitiveScore to return previous average
      jest.spyOn(performanceService, 'getAverageCognitiveScore').mockResolvedValueOnce(72.5); // Average of 70 and 75

      // Mock today's completion score
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    id: 3,
                    date: dayjs().format('YYYY-MM-DD'),
                    cognitiveScore: 85,
                    reactionTime: 250,
                  },
                ])
              ),
            })),
          })),
        })),
      });

      const scoreGain = await performanceService.getScoreGain();
      expect(scoreGain).toBe(13); // 85 - 72.5 ≈ 13
    });

    it('should calculate negative gain when today score is lower than average', async () => {
      const mockDb = require('@/db').db;

      // Mock getAverageCognitiveScore to return higher previous average
      jest.spyOn(performanceService, 'getAverageCognitiveScore').mockResolvedValueOnce(87.5); // Average of 90 and 85

      // Mock today's lower completion score
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    id: 3,
                    date: dayjs().format('YYYY-MM-DD'),
                    cognitiveScore: 70,
                    reactionTime: 350,
                  },
                ])
              ),
            })),
          })),
        })),
      });

      const scoreGain = await performanceService.getScoreGain();
      expect(scoreGain).toBe(-17); // 70 - 87.5 ≈ -17
    });

    it('should return 0 if not completed today', async () => {
      const mockDb = require('@/db').db;

      // Mock no completion today
      mockDb.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve([])),
            })),
          })),
        })),
      });

      const scoreGain = await performanceService.getScoreGain();
      expect(scoreGain).toBe(0);
    });
  });

  describe('recordAlarmCompletion', () => {
    it('should insert a new completion into the database', async () => {
      const mockDb = require('@/db').db;
      const mockInsert = jest.fn(() => ({
        values: jest.fn(() => Promise.resolve()),
      }));
      mockDb.insert = mockInsert;

      await performanceService.recordAlarmCompletion({
        targetTime: '06:00',
        actualTime: dayjs().toISOString(),
        cognitiveScore: 80,
        reactionTime: 250,
        challengeType: 'Math Challenge',
      });

      expect(mockInsert).toHaveBeenCalled();
    });
  });
});
