import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc, gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';
import type { PeriodType } from '@/features/dashboard/types';
import { calculateExecutionScore } from '@/utils/cognitive-score';

export interface SleepQualityData {
  avgSleepHours: number;
  qualityScore: number; // 0-100
  correlation: number; // -1 to 1 (correlation between sleep and performance)
  recommendation: string; // Translation key
  trendDirection: 'up' | 'down' | 'stable';
  sparklineData: number[]; // Daily sleep hours
}

/**
 * Calculate sleep quality metrics based on alarm completion patterns
 * Estimates sleep duration by looking at previous alarm completion time
 */
export function useSleepQuality(period: PeriodType, refreshKey?: number): SleepQualityData {
  const [data, setData] = useState<SleepQualityData>({
    avgSleepHours: 0,
    qualityScore: 0,
    correlation: 0,
    recommendation: 'dashboard.sleep.maintainSchedule',
    trendDirection: 'stable',
    sparklineData: [],
  });

  useEffect(() => {
    const calculateQuality = async () => {
      const now = dayjs();
      let startDate: dayjs.Dayjs;
      let days: number;

      switch (period) {
        case 'day':
          startDate = now.subtract(1, 'day').startOf('day');
          days = 2;
          break;
        case 'week':
          startDate = now.subtract(7, 'day').startOf('day');
          days = 7;
          break;
        case 'month':
          startDate = now.subtract(30, 'day').startOf('day');
          days = 30;
          break;
        default:
          startDate = now.subtract(7, 'day').startOf('day');
          days = 7;
      }

      const completions = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')))
        .orderBy(desc(alarmCompletions.date));

      if (completions.length < 2) {
        setData({
          avgSleepHours: 0,
          qualityScore: 0,
          correlation: 0,
          recommendation: 'dashboard.sleep.needMoreData',
          trendDirection: 'stable',
          sparklineData: [],
        });
        return;
      }

      // Estimate sleep hours and correlate with performance
      const sleepData: Array<{ hours: number; score: number; date: string }> = [];

      for (let i = 0; i < completions.length - 1; i++) {
        const current = completions[i];
        const previous = completions[i + 1];

        const currentTime = dayjs(current.actualTime);
        const previousTime = dayjs(previous.actualTime);

        // Estimate sleep hours (time between previous alarm and current alarm)
        let sleepHours = currentTime.diff(previousTime, 'hour', true);

        // Handle day wrapping (assume sleep if difference is reasonable, e.g., 16-24 hours)
        if (sleepHours < 0 || sleepHours > 24) {
          sleepHours = 7; // Default assumption
        }

        const score = calculateExecutionScore({
          cognitiveScore: current.cognitiveScore,
          reactionTime: current.reactionTime,
          targetTime: current.targetTime,
          actualTime: current.actualTime,
        });

        sleepData.push({
          hours: sleepHours,
          score,
          date: current.date,
        });
      }

      // Calculate average sleep hours
      const avgSleepHours = sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length;

      // Calculate correlation between sleep and performance
      const correlation = calculateCorrelation(
        sleepData.map((d) => d.hours),
        sleepData.map((d) => d.score)
      );

      // Determine quality score (based on avg sleep and correlation)
      let qualityScore = 50; // Base score

      // Adjust based on average sleep hours (7-9 hours is optimal)
      if (avgSleepHours >= 7 && avgSleepHours <= 9) {
        qualityScore += 30;
      } else if (avgSleepHours >= 6 && avgSleepHours <= 10) {
        qualityScore += 15;
      }

      // Adjust based on correlation (positive correlation is good)
      if (correlation > 0.3) {
        qualityScore += 20;
      } else if (correlation > 0) {
        qualityScore += 10;
      }

      qualityScore = Math.min(100, qualityScore);

      // Determine recommendation
      let recommendation = 'dashboard.sleep.maintainSchedule';
      if (avgSleepHours < 6) {
        recommendation = 'dashboard.sleep.increaseHours';
      } else if (avgSleepHours > 10) {
        recommendation = 'dashboard.sleep.reduceSleepTime';
      } else if (correlation < 0) {
        recommendation = 'dashboard.sleep.improveQuality';
      }

      // Calculate trend
      const midPoint = Math.floor(sleepData.length / 2);
      const firstHalf = sleepData.slice(0, midPoint);
      const secondHalf = sleepData.slice(midPoint);

      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.hours, 0) / (firstHalf.length || 1);
      const secondHalfAvg =
        secondHalf.reduce((sum, d) => sum + d.hours, 0) / (secondHalf.length || 1);

      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (secondHalfAvg - firstHalfAvg > 0.5) {
        trendDirection = 'up';
      } else if (firstHalfAvg - secondHalfAvg > 0.5) {
        trendDirection = 'down';
      }

      // Generate sparkline data (last 7 days)
      const sparklineData = sleepData
        .slice(0, 7)
        .reverse()
        .map((d) => Math.round(d.hours * 10) / 10);

      setData({
        avgSleepHours: Math.round(avgSleepHours * 10) / 10,
        qualityScore: Math.round(qualityScore),
        correlation: Math.round(correlation * 100) / 100,
        recommendation,
        trendDirection,
        sparklineData,
      });
    };

    calculateQuality();
  }, [period, refreshKey]);

  return data;
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;

  return numerator / denominator;
}
