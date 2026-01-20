import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';
import type { PeriodType } from '@/features/dashboard/types';

interface CognitiveActivationData {
  date: string; // YYYY-MM-DD
  count: number; // Number of completed alarms
  avgScore: number; // Average cognitive score for the day
}

// Get number of days based on period
function getDaysForPeriod(period: PeriodType): number {
  switch (period) {
    case 'day':
      return 7; // Last 7 days (1 week)
    case 'week':
      return 30; // Last 30 days
    case 'month':
    case 'custom':
    default:
      return 90; // Last 90 days
  }
}

/**
 * Custom hook to fetch cognitive activation data for contribution graph
 * Returns data based on the selected period
 */
export function useCognitiveActivation(period: PeriodType = 'month'): CognitiveActivationData[] {
  const [data, setData] = useState<CognitiveActivationData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const now = dayjs();
      const numDays = getDaysForPeriod(period);
      const startDate = now.subtract(numDays - 1, 'day').startOf('day');

      // Fetch all completions in the period
      const records = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')));

      // Group by date and calculate average score
      const groupedData = new Map<string, { scores: number[]; count: number }>();

      records.forEach((record) => {
        const dateKey = dayjs(record.date).format('YYYY-MM-DD');
        const existing = groupedData.get(dateKey) || { scores: [], count: 0 };
        existing.scores.push(record.cognitiveScore);
        existing.count += 1;
        groupedData.set(dateKey, existing);
      });

      // Convert to array format
      const result: CognitiveActivationData[] = [];
      for (let i = 0; i < numDays; i++) {
        const date = startDate.add(i, 'day').format('YYYY-MM-DD');
        const dayData = groupedData.get(date);

        if (dayData && dayData.scores.length > 0) {
          const avgScore = dayData.scores.reduce((sum, s) => sum + s, 0) / dayData.scores.length;
          result.push({
            date,
            count: dayData.count,
            avgScore: Math.round(avgScore),
          });
        } else {
          result.push({
            date,
            count: 0,
            avgScore: 0,
          });
        }
      }

      setData(result);
    };

    fetchData();
  }, [period]);

  return data;
}
