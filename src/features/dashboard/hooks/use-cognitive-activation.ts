import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';

interface CognitiveActivationData {
  date: string; // YYYY-MM-DD
  count: number; // Number of completed alarms
  avgScore: number; // Average cognitive score for the day
}

/**
 * Custom hook to fetch cognitive activation data for current month
 * Returns data for all days in the current month
 */
export function useCognitiveActivation(): CognitiveActivationData[] {
  const [data, setData] = useState<CognitiveActivationData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const now = dayjs();
      const startOfMonth = now.startOf('month');
      const endOfMonth = now.endOf('month');

      // Fetch all completions in the current month
      const records = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startOfMonth.format('YYYY-MM-DD')));

      // Group by date and calculate average score
      const groupedData = new Map<string, { scores: number[]; count: number }>();

      records.forEach((record) => {
        const dateKey = dayjs(record.date).format('YYYY-MM-DD');
        const existing = groupedData.get(dateKey) || { scores: [], count: 0 };
        existing.scores.push(record.cognitiveScore);
        existing.count += 1;
        groupedData.set(dateKey, existing);
      });

      // Convert to array format for all days in month
      const result: CognitiveActivationData[] = [];
      const daysInMonth = endOfMonth.date();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = dayjs(startOfMonth).date(day).format('YYYY-MM-DD');
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

    // Refresh data when month changes
    const interval = setInterval(() => {
      const newMonth = dayjs().format('YYYY-MM');
      const currentMonth = dayjs().startOf('month').format('YYYY-MM');
      if (newMonth !== currentMonth) {
        fetchData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return data;
}
