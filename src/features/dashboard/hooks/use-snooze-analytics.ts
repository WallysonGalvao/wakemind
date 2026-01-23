import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc, gte } from 'drizzle-orm';

import { db } from '@/db';
import { snoozeLogs } from '@/db/schema';
import type { PeriodType } from '@/features/dashboard/types';

export interface SnoozeAnalytics {
  avgSnoozeCount: number;
  totalSnoozes: number;
  totalTimeLostMinutes: number;
  firstTouchRate: number; // Percentage of alarms dismissed without snooze
  trendDirection: 'up' | 'down' | 'stable';
  sparklineData: number[]; // Daily snooze counts for visualization
}

const SNOOZE_DURATION_MINUTES = 5; // Standard snooze duration

/**
 * Calculate snooze analytics for the selected period
 */
export function useSnoozeAnalytics(period: PeriodType, refreshKey?: number): SnoozeAnalytics {
  const [analytics, setAnalytics] = useState<SnoozeAnalytics>({
    avgSnoozeCount: 0,
    totalSnoozes: 0,
    totalTimeLostMinutes: 0,
    firstTouchRate: 100,
    trendDirection: 'stable',
    sparklineData: [],
  });

  useEffect(() => {
    const calculateAnalytics = async () => {
      const now = dayjs();
      let startDate: dayjs.Dayjs;
      let daysInPeriod: number;

      // Determine start date based on period
      switch (period) {
        case 'day':
          startDate = now.startOf('day');
          daysInPeriod = 1;
          break;
        case 'week':
          startDate = now.subtract(6, 'day').startOf('day');
          daysInPeriod = 7;
          break;
        case 'month':
          startDate = now.subtract(29, 'day').startOf('day');
          daysInPeriod = 30;
          break;
        default:
          startDate = now.startOf('day');
          daysInPeriod = 1;
      }

      // Fetch snooze logs for the period
      const logs = await db
        .select()
        .from(snoozeLogs)
        .where(gte(snoozeLogs.date, startDate.format('YYYY-MM-DD')))
        .orderBy(desc(snoozeLogs.date));

      console.log('[SnoozeAnalytics] Period:', period, 'Start:', startDate.format('YYYY-MM-DD'));
      console.log('[SnoozeAnalytics] Found logs:', logs.length);

      if (logs.length === 0) {
        console.log('[SnoozeAnalytics] No data found, returning defaults');
        setAnalytics({
          avgSnoozeCount: 0,
          totalSnoozes: 0,
          totalTimeLostMinutes: 0,
          firstTouchRate: 100,
          trendDirection: 'stable',
          sparklineData: Array(Math.min(daysInPeriod, 7)).fill(0),
        });
        return;
      }

      // Calculate total snoozes
      const totalSnoozes = logs.reduce((sum, log) => sum + log.snoozeCount, 0);

      // Calculate average snoozes per alarm
      const avgSnoozeCount = totalSnoozes / logs.length;

      // Calculate total time lost (snoozes * duration)
      const totalTimeLostMinutes = totalSnoozes * SNOOZE_DURATION_MINUTES;

      // Calculate first touch rate (alarms dismissed without snooze)
      const firstTouchCount = logs.filter((log) => log.snoozeCount === 0).length;
      const firstTouchRate = (firstTouchCount / logs.length) * 100;

      console.log('[SnoozeAnalytics] Calculated:', {
        totalSnoozes,
        avgSnoozeCount,
        totalTimeLostMinutes,
        firstTouchRate,
        firstTouchCount,
      });

      // Calculate trend (compare first half vs second half of period)
      const midPoint = Math.floor(logs.length / 2);
      const firstHalf = logs.slice(0, midPoint);
      const secondHalf = logs.slice(midPoint);

      const firstHalfAvg =
        firstHalf.reduce((sum, log) => sum + log.snoozeCount, 0) / (firstHalf.length || 1);
      const secondHalfAvg =
        secondHalf.reduce((sum, log) => sum + log.snoozeCount, 0) / (secondHalf.length || 1);

      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (firstHalfAvg - secondHalfAvg > 0.5) {
        trendDirection = 'down'; // Improving (fewer snoozes)
      } else if (secondHalfAvg - firstHalfAvg > 0.5) {
        trendDirection = 'up'; // Worsening (more snoozes)
      }

      // Generate sparkline data (daily snooze counts for last 7 days)
      const sparklineDays = Math.min(daysInPeriod, 7);
      const sparklineData: number[] = [];
      for (let i = sparklineDays - 1; i >= 0; i--) {
        const date = now.subtract(i, 'day').format('YYYY-MM-DD');
        const dayLogs = logs.filter((log) => log.date === date);
        const daySnoozes = dayLogs.reduce((sum, log) => sum + log.snoozeCount, 0);
        sparklineData.push(daySnoozes);
      }

      setAnalytics({
        avgSnoozeCount: Math.round(avgSnoozeCount * 10) / 10, // Round to 1 decimal
        totalSnoozes,
        totalTimeLostMinutes,
        firstTouchRate: Math.round(firstTouchRate),
        trendDirection,
        sparklineData,
      });
    };

    calculateAnalytics();
  }, [period, refreshKey]);

  return analytics;
}
