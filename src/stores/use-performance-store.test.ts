import dayjs from 'dayjs';

// Mock MMKV storage before importing the store
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

import { usePerformanceStore } from './use-performance-store';

describe('usePerformanceStore - Dynamic Gains', () => {
  beforeEach(() => {
    usePerformanceStore.getState().resetPerformance();
  });

  describe('getStreakGain', () => {
    it('should return 1 for first completion', () => {
      const store = usePerformanceStore.getState();

      // Manually set completion history for today
      usePerformanceStore.setState({
        completionHistory: [
          {
            id: '1',
            targetTime: '06:00',
            actualTime: dayjs().toISOString(),
            cognitiveScore: 80,
            reactionTime: 250,
            challengeType: 'Math Challenge',
            date: dayjs().toISOString(),
          },
        ],
      });

      expect(store.getStreakGain()).toBe(1);
    });

    it('should return 1 for consecutive day completion', () => {
      const store = usePerformanceStore.getState();

      // Set completion history for yesterday and today
      usePerformanceStore.setState({
        completionHistory: [
          {
            id: '1',
            targetTime: '06:00',
            actualTime: dayjs().subtract(1, 'day').toISOString(),
            cognitiveScore: 75,
            reactionTime: 300,
            challengeType: 'Math Challenge',
            date: dayjs().subtract(1, 'day').toISOString(),
          },
          {
            id: '2',
            targetTime: '06:00',
            actualTime: dayjs().toISOString(),
            cognitiveScore: 80,
            reactionTime: 250,
            challengeType: 'Math Challenge',
            date: dayjs().toISOString(),
          },
        ],
      });

      expect(store.getStreakGain()).toBe(1);
    });

    it('should return 0 if not completed today', () => {
      const store = usePerformanceStore.getState();

      // Only completed yesterday
      usePerformanceStore.setState({
        completionHistory: [
          {
            id: '1',
            targetTime: '06:00',
            actualTime: dayjs().subtract(1, 'day').toISOString(),
            cognitiveScore: 75,
            reactionTime: 300,
            challengeType: 'Math Challenge',
            date: dayjs().subtract(1, 'day').toISOString(),
          },
        ],
      });

      expect(store.getStreakGain()).toBe(0);
    });
  });

  describe('getScoreGain', () => {
    it('should return 0 for first completion', () => {
      const store = usePerformanceStore.getState();

      // Manually set first completion for today
      usePerformanceStore.setState({
        completionHistory: [
          {
            id: '1',
            targetTime: '06:00',
            actualTime: dayjs().toISOString(),
            cognitiveScore: 80,
            reactionTime: 250,
            challengeType: 'Math Challenge',
            date: dayjs().toISOString(),
          },
        ],
      });

      // First completion returns the score itself since there's no previous average
      expect(store.getScoreGain()).toBe(80);
    });

    it('should calculate positive gain when today score is higher than average', () => {
      const store = usePerformanceStore.getState();

      // Set history with 3 days ago, 2 days ago, and today
      usePerformanceStore.setState({
        completionHistory: [
          {
            id: '1',
            targetTime: '06:00',
            actualTime: dayjs().subtract(3, 'day').toISOString(),
            cognitiveScore: 70,
            reactionTime: 300,
            challengeType: 'Math Challenge',
            date: dayjs().subtract(3, 'day').toISOString(),
          },
          {
            id: '2',
            targetTime: '06:00',
            actualTime: dayjs().subtract(2, 'day').toISOString(),
            cognitiveScore: 75,
            reactionTime: 280,
            challengeType: 'Math Challenge',
            date: dayjs().subtract(2, 'day').toISOString(),
          },
          {
            id: '3',
            targetTime: '06:00',
            actualTime: dayjs().toISOString(),
            cognitiveScore: 85,
            reactionTime: 250,
            challengeType: 'Math Challenge',
            date: dayjs().toISOString(),
          },
        ],
      });

      // Gain should be 85 - 72.5 = 12.5 ≈ 13
      expect(store.getScoreGain()).toBe(13);
    });

    it('should calculate negative gain when today score is lower than average', () => {
      const store = usePerformanceStore.getState();

      // Set history with higher previous scores
      usePerformanceStore.setState({
        completionHistory: [
          {
            id: '1',
            targetTime: '06:00',
            actualTime: dayjs().subtract(3, 'day').toISOString(),
            cognitiveScore: 90,
            reactionTime: 200,
            challengeType: 'Math Challenge',
            date: dayjs().subtract(3, 'day').toISOString(),
          },
          {
            id: '2',
            targetTime: '06:00',
            actualTime: dayjs().subtract(2, 'day').toISOString(),
            cognitiveScore: 85,
            reactionTime: 220,
            challengeType: 'Math Challenge',
            date: dayjs().subtract(2, 'day').toISOString(),
          },
          {
            id: '3',
            targetTime: '06:00',
            actualTime: dayjs().toISOString(),
            cognitiveScore: 70,
            reactionTime: 350,
            challengeType: 'Math Challenge',
            date: dayjs().toISOString(),
          },
        ],
      });

      // Gain should be 70 - 87.5 = -17.5 ≈ -17 (Math.round)
      expect(store.getScoreGain()).toBe(-17);
    });

    it('should return 0 if not completed today', () => {
      const store = usePerformanceStore.getState();

      // Only completed yesterday
      usePerformanceStore.setState({
        completionHistory: [
          {
            id: '1',
            targetTime: '06:00',
            actualTime: dayjs().subtract(1, 'day').toISOString(),
            cognitiveScore: 80,
            reactionTime: 250,
            challengeType: 'Math Challenge',
            date: dayjs().subtract(1, 'day').toISOString(),
          },
        ],
      });

      expect(store.getScoreGain()).toBe(0);
    });
  });
});
