import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { and, desc, gte, lte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';
import type { PeriodType } from '@/features/dashboard/types';

interface ExecutionScoreData {
  score: number;
  percentageChange: number;
  sparklineData: number[];
}

/**
 * Custom hook to calculate execution score based on alarm completions
 */
export function useExecutionScore(period: PeriodType): ExecutionScoreData {
  const [data, setData] = useState<ExecutionScoreData>({
    score: 0,
    percentageChange: 0,
    sparklineData: [],
  });

  useEffect(() => {
    const calculateScore = async () => {
      const now = dayjs();
      let startDate: dayjs.Dayjs;
      let previousStartDate: dayjs.Dayjs;
      let previousEndDate: dayjs.Dayjs;

      // Define period ranges
      switch (period) {
        case 'day':
          startDate = now.startOf('day');
          previousStartDate = now.subtract(1, 'day').startOf('day');
          previousEndDate = now.subtract(1, 'day').endOf('day');
          break;
        case 'week':
          startDate = now.subtract(6, 'day').startOf('day');
          previousStartDate = now.subtract(13, 'day').startOf('day');
          previousEndDate = now.subtract(7, 'day').endOf('day');
          break;
        case 'month':
          startDate = now.subtract(29, 'day').startOf('day');
          previousStartDate = now.subtract(59, 'day').startOf('day');
          previousEndDate = now.subtract(30, 'day').endOf('day');
          break;
        case 'custom':
          // 14 days for custom
          startDate = now.subtract(13, 'day').startOf('day');
          previousStartDate = now.subtract(27, 'day').startOf('day');
          previousEndDate = now.subtract(14, 'day').endOf('day');
          break;
        default:
          startDate = now.startOf('day');
          previousStartDate = now.subtract(1, 'day').startOf('day');
          previousEndDate = now.subtract(1, 'day').endOf('day');
      }

      // Fetch current period records
      const currentRecords = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')))
        .orderBy(desc(alarmCompletions.date));

      // Fetch previous period records for comparison
      const previousRecords = await db
        .select()
        .from(alarmCompletions)
        .where(
          and(
            gte(alarmCompletions.date, previousStartDate.format('YYYY-MM-DD')),
            lte(alarmCompletions.date, previousEndDate.format('YYYY-MM-DD'))
          )
        );

      // Calculate current score (average cognitive score)
      const currentScore =
        currentRecords.length > 0
          ? Math.round(
              currentRecords.reduce((sum, r) => sum + r.cognitiveScore, 0) / currentRecords.length
            )
          : 0;

      // Calculate previous score
      const previousScore =
        previousRecords.length > 0
          ? Math.round(
              previousRecords.reduce((sum, r) => sum + r.cognitiveScore, 0) / previousRecords.length
            )
          : 0;

      // Calculate percentage change
      const percentageChange =
        previousScore > 0 ? ((currentScore - previousScore) / previousScore) * 100 : 0;

      // Generate sparkline data (distributed across period)
      const sparklinePoints = 10;
      const sparklineData: number[] = [];

      if (currentRecords.length > 0) {
        if (currentRecords.length <= sparklinePoints) {
          // If we have fewer records than points, use all records
          sparklineData.push(...currentRecords.map((r) => r.cognitiveScore).reverse());
          // Fill remaining with zeros at the start
          while (sparklineData.length < sparklinePoints) {
            sparklineData.unshift(0);
          }
        } else {
          // Distribute points evenly across the dataset
          const step = currentRecords.length / sparklinePoints;
          for (let i = 0; i < sparklinePoints; i++) {
            const index = Math.floor(i * step);
            sparklineData.push(currentRecords[currentRecords.length - 1 - index].cognitiveScore);
          }
          sparklineData.reverse();
        }
      } else {
        // No data, fill with zeros
        sparklineData.push(...Array(sparklinePoints).fill(0));
      }

      setData({
        score: currentScore,
        percentageChange: Math.round(percentageChange * 10) / 10, // Round to 1 decimal
        sparklineData,
      });
    };

    calculateScore();
  }, [period]);

  return data;
}
