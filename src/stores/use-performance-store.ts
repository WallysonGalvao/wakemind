import dayjs from 'dayjs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createMMKVStorage } from '@/utils/storage';

export interface AlarmCompletionRecord {
  id: string;
  targetTime: string; // HH:mm format
  actualTime: string; // ISO string
  cognitiveScore: number; // 0-100
  reactionTime: number; // milliseconds
  challengeType: string;
  date: string; // ISO date
}

export interface WeeklyStats {
  executionRate: number; // 0-100
  averageCognitiveScore: number;
  averageReactionTime: number;
  completedDays: number;
  totalScheduledDays: number;
}

interface PerformanceState {
  currentStreak: number;
  longestStreak: number;
  totalAlarmsCompleted: number;
  completionHistory: AlarmCompletionRecord[];
  lastCompletionDate: string | null;

  // Actions
  recordAlarmCompletion: (record: Omit<AlarmCompletionRecord, 'id' | 'date'>) => void;
  getWeeklyStats: () => WeeklyStats;
  getPreviousWeekExecutionRate: () => number;
  getCurrentStreak: () => number;
  getAverageCognitiveScore: () => number;
  getRecentReactionTimes: (days?: number) => number[];
  getStreakGain: () => number;
  getScoreGain: () => number;
  resetPerformance: () => void;
}

const STORAGE_KEY = 'wakemind-performance-store';

const initialState = {
  currentStreak: 0,
  longestStreak: 0,
  totalAlarmsCompleted: 0,
  completionHistory: [],
  lastCompletionDate: null,
};

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordAlarmCompletion: (record) => {
        const now = dayjs();
        const today = now.format('YYYY-MM-DD');
        const { lastCompletionDate, completionHistory, currentStreak, longestStreak } = get();

        // Check if already completed today
        const alreadyCompletedToday = completionHistory.some(
          (r) => dayjs(r.date).format('YYYY-MM-DD') === today
        );

        if (alreadyCompletedToday) {
          // Update today's record instead of adding new
          const updatedHistory = completionHistory.map((r) => {
            if (dayjs(r.date).format('YYYY-MM-DD') === today) {
              return {
                ...r,
                ...record,
              };
            }
            return r;
          });

          set({ completionHistory: updatedHistory });
          return;
        }

        // Calculate new streak
        let newStreak = 1;
        if (lastCompletionDate) {
          const lastDate = dayjs(lastCompletionDate);
          const diffDays = now.diff(lastDate, 'day');

          if (diffDays === 1) {
            // Consecutive day
            newStreak = currentStreak + 1;
          } else if (diffDays === 0) {
            // Same day (shouldn't happen, but just in case)
            newStreak = currentStreak;
          }
          // else: streak broken, reset to 1
        }

        const newRecord: AlarmCompletionRecord = {
          id: `${Date.now()}_${Math.random()}`,
          ...record,
          date: now.toISOString(),
        };

        const newLongestStreak = Math.max(longestStreak, newStreak);

        set({
          completionHistory: [...completionHistory, newRecord],
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          totalAlarmsCompleted: get().totalAlarmsCompleted + 1,
          lastCompletionDate: now.toISOString(),
        });
      },

      getWeeklyStats: () => {
        const now = dayjs();
        const weekStart = now.subtract(6, 'day').startOf('day');
        const { completionHistory } = get();

        const weekRecords = completionHistory.filter((record) => {
          const recordDate = dayjs(record.date);
          return recordDate.isAfter(weekStart) || recordDate.isSame(weekStart, 'day');
        });

        const completedDays = new Set(weekRecords.map((r) => dayjs(r.date).format('YYYY-MM-DD')))
          .size;

        const totalScheduledDays = 7;
        const executionRate = (completedDays / totalScheduledDays) * 100;

        const averageCognitiveScore =
          weekRecords.length > 0
            ? weekRecords.reduce((sum, r) => sum + r.cognitiveScore, 0) / weekRecords.length
            : 0;

        const averageReactionTime =
          weekRecords.length > 0
            ? weekRecords.reduce((sum, r) => sum + r.reactionTime, 0) / weekRecords.length
            : 0;

        return {
          executionRate: Math.round(executionRate),
          averageCognitiveScore: Math.round(averageCognitiveScore),
          averageReactionTime: Math.round(averageReactionTime),
          completedDays,
          totalScheduledDays,
        };
      },

      getPreviousWeekExecutionRate: () => {
        const now = dayjs();
        // Previous week is from 13 days ago to 7 days ago
        const previousWeekStart = now.subtract(13, 'day').startOf('day');
        const previousWeekEnd = now.subtract(7, 'day').endOf('day');
        const { completionHistory } = get();

        const previousWeekRecords = completionHistory.filter((record) => {
          const recordDate = dayjs(record.date);
          return (
            (recordDate.isAfter(previousWeekStart) ||
              recordDate.isSame(previousWeekStart, 'day')) &&
            (recordDate.isBefore(previousWeekEnd) || recordDate.isSame(previousWeekEnd, 'day'))
          );
        });

        const completedDays = new Set(
          previousWeekRecords.map((r) => dayjs(r.date).format('YYYY-MM-DD'))
        ).size;

        const totalScheduledDays = 7;
        const executionRate = (completedDays / totalScheduledDays) * 100;

        return Math.round(executionRate);
      },

      getCurrentStreak: () => {
        const { currentStreak, lastCompletionDate } = get();

        if (!lastCompletionDate) return 0;

        const lastDate = dayjs(lastCompletionDate);
        const now = dayjs();
        const diffDays = now.diff(lastDate, 'day');

        // If last completion was more than 1 day ago, streak is broken
        if (diffDays > 1) {
          set({ currentStreak: 0 });
          return 0;
        }

        return currentStreak;
      },

      getAverageCognitiveScore: () => {
        const { completionHistory } = get();
        if (completionHistory.length === 0) return 0;

        const sum = completionHistory.reduce((acc, record) => acc + record.cognitiveScore, 0);
        return Math.round(sum / completionHistory.length);
      },

      getRecentReactionTimes: (days = 7) => {
        const { completionHistory } = get();
        const today = dayjs();
        const result: number[] = [];

        // Get the start of the current week (Monday)
        const weekStart = today.startOf('week').add(1, 'day'); // dayjs week starts on Sunday, so add 1 day for Monday

        // Generate array for Monday through Sunday of current week
        for (let i = 0; i < days; i++) {
          const targetDate = weekStart.add(i, 'day').format('YYYY-MM-DD');
          const record = completionHistory.find(
            (r) => dayjs(r.date).format('YYYY-MM-DD') === targetDate
          );
          result.push(record?.reactionTime || 0);
        }

        return result;
      },

      getStreakGain: () => {
        const { completionHistory } = get();
        if (completionHistory.length === 0) return 0;

        const today = dayjs().format('YYYY-MM-DD');
        const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

        // Check if completed today
        const completedToday = completionHistory.some(
          (r) => dayjs(r.date).format('YYYY-MM-DD') === today
        );

        // If not completed today, no gain
        if (!completedToday) return 0;

        // If this is the first completion ever, it's a +1 day gain
        if (completionHistory.length === 1) return 1;

        // Check if completed yesterday
        const completedYesterday = completionHistory.some(
          (r) => dayjs(r.date).format('YYYY-MM-DD') === yesterday
        );

        // If completed both days (consecutive), it's a +1 day gain
        if (completedYesterday) {
          return 1;
        }

        // If only completed today but not yesterday, streak restarted
        // Still a +1 from 0
        return 1;
      },

      getScoreGain: () => {
        const { completionHistory } = get();
        if (completionHistory.length === 0) return 0;

        const today = dayjs().format('YYYY-MM-DD');

        // Get today's completion
        const todayRecord = completionHistory.find(
          (r) => dayjs(r.date).format('YYYY-MM-DD') === today
        );

        if (!todayRecord) return 0;

        // Get previous completions (excluding today)
        const previousRecords = completionHistory.filter(
          (r) => dayjs(r.date).format('YYYY-MM-DD') !== today
        );

        // If this is the first completion, return the full score
        if (previousRecords.length === 0) return todayRecord.cognitiveScore;

        // Calculate previous average
        const previousAverage =
          previousRecords.reduce((sum, r) => sum + r.cognitiveScore, 0) / previousRecords.length;

        // Return the difference
        return Math.round(todayRecord.cognitiveScore - previousAverage);
      },

      resetPerformance: () => {
        set(initialState);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createMMKVStorage(STORAGE_KEY)),
    }
  )
);
