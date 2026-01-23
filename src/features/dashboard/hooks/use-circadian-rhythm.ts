import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc, gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';

export interface CircadianData {
  avgWakeTime: string; // HH:mm format
  alignmentScore: number; // 0-100
  suggestion: string; // Translation key
  optimalWakeWindow: { start: string; end: string }; // HH:mm format
  consistencyScore: number; // 0-100
  sparklineData: number[]; // Minutes from midnight for visualization
}

const SLEEP_CYCLE_MINUTES = 90; // Average sleep cycle duration

/**
 * Analyze circadian rhythm alignment and suggest optimal wake times
 * Based on sleep cycle theory (90-minute cycles)
 */
export function useCircadianRhythm(refreshKey?: number): CircadianData {
  const [data, setData] = useState<CircadianData>({
    avgWakeTime: '06:00',
    alignmentScore: 50,
    suggestion: 'dashboard.circadian.maintainSchedule',
    optimalWakeWindow: { start: '06:00', end: '06:30' },
    consistencyScore: 50,
    sparklineData: [],
  });

  useEffect(() => {
    const analyzeCircadian = async () => {
      const now = dayjs();
      const startDate = now.subtract(30, 'day').startOf('day');

      const completions = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')))
        .orderBy(desc(alarmCompletions.date));

      if (completions.length < 3) {
        setData({
          avgWakeTime: '06:00',
          alignmentScore: 50,
          suggestion: 'dashboard.circadian.needMoreData',
          optimalWakeWindow: { start: '06:00', end: '06:30' },
          consistencyScore: 50,
          sparklineData: [],
        });
        return;
      }

      // Calculate average wake time in minutes from midnight
      const wakeMinutes = completions.map((c) => {
        const time = dayjs(c.actualTime);
        return time.hour() * 60 + time.minute();
      });

      const avgMinutes = wakeMinutes.reduce((sum, m) => sum + m, 0) / wakeMinutes.length;

      // Convert average to HH:mm format
      const avgHours = Math.floor(avgMinutes / 60);
      const avgMins = Math.round(avgMinutes % 60);
      const avgWakeTime = `${String(avgHours).padStart(2, '0')}:${String(avgMins).padStart(2, '0')}`;

      // Calculate consistency (standard deviation)
      const variance =
        wakeMinutes.reduce((sum, m) => sum + Math.pow(m - avgMinutes, 2), 0) / wakeMinutes.length;
      const stdDev = Math.sqrt(variance);

      // Consistency score (lower deviation = higher score)
      const consistencyScore = Math.max(0, Math.min(100, 100 - stdDev * 2));

      // Find optimal wake window aligned with sleep cycles
      // Assume average sleep duration of 7.5 hours (5 cycles)
      const assumedSleepStart = avgMinutes - 450; // 7.5 hours before avg wake
      const cycleCount = Math.round((avgMinutes - assumedSleepStart) / SLEEP_CYCLE_MINUTES);

      // Optimal wake time is at end of a sleep cycle
      const optimalWakeMinutes = assumedSleepStart + cycleCount * SLEEP_CYCLE_MINUTES;
      const optimalHours = Math.floor(optimalWakeMinutes / 60) % 24;
      const optimalMins = Math.round(optimalWakeMinutes % 60);

      // Create 30-minute window
      const windowStart = optimalWakeMinutes - 15;
      const windowEnd = optimalWakeMinutes + 15;

      const optimalWakeWindow = {
        start: `${String(Math.floor(windowStart / 60) % 24).padStart(2, '0')}:${String(Math.round(windowStart % 60)).padStart(2, '0')}`,
        end: `${String(Math.floor(windowEnd / 60) % 24).padStart(2, '0')}:${String(Math.round(windowEnd % 60)).padStart(2, '0')}`,
      };

      // Calculate alignment score (how close current avg is to optimal)
      const alignmentDiff = Math.abs(avgMinutes - optimalWakeMinutes);
      const alignmentScore = Math.max(0, Math.min(100, 100 - alignmentDiff));

      // Determine suggestion
      let suggestion = 'dashboard.circadian.maintainSchedule';
      if (alignmentScore < 70) {
        if (avgMinutes < optimalWakeMinutes) {
          suggestion = 'dashboard.circadian.wakeEarlier';
        } else {
          suggestion = 'dashboard.circadian.wakeLater';
        }
      }

      if (consistencyScore < 60) {
        suggestion = 'dashboard.circadian.improveConsistency';
      }

      // Generate sparkline data (last 7 days)
      const sparklineData = completions
        .slice(0, 7)
        .reverse()
        .map((c) => {
          const time = dayjs(c.actualTime);
          return time.hour() * 60 + time.minute();
        });

      setData({
        avgWakeTime,
        alignmentScore: Math.round(alignmentScore),
        suggestion,
        optimalWakeWindow,
        consistencyScore: Math.round(consistencyScore),
        sparklineData,
      });
    };

    analyzeCircadian();
  }, [refreshKey]);

  return data;
}
