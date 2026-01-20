import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc, gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';
import type { PeriodType } from '@/features/dashboard/types';

/**
 * Calculate current streak of consecutive days meeting wake time target
 * A day is "on target" if the user woke up within acceptable variance
 */
export function useCurrentStreak(period: PeriodType = 'month'): number {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const calculateStreak = async () => {
      const now = dayjs();
      const startDate = now.subtract(90, 'day').startOf('day'); // Look back 90 days max

      // Fetch all completions in descending date order
      const records = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')))
        .orderBy(desc(alarmCompletions.date));

      if (records.length === 0) {
        setStreak(0);
        return;
      }

      // Group by date and check if each day met target
      const dailyResults = new Map<string, boolean>();

      records.forEach((record) => {
        const date = record.date;
        const target = dayjs(record.targetTime, 'HH:mm');
        const actual = dayjs(record.actualTime, 'HH:mm');

        // Calculate variance in minutes (acceptable: within 10 minutes)
        const variance = Math.abs(actual.diff(target, 'minute'));
        const onTarget = variance <= 10;

        // Mark day as on target if ANY completion that day was on target
        if (!dailyResults.has(date) || onTarget) {
          dailyResults.set(date, onTarget);
        }
      });

      // Calculate streak from today backwards
      let currentStreak = 0;
      let checkDate = now.startOf('day');

      // Start from yesterday (today may not be complete yet)
      checkDate = checkDate.subtract(1, 'day');

      while (true) {
        const dateStr = checkDate.format('YYYY-MM-DD');
        const wasOnTarget = dailyResults.get(dateStr);

        if (wasOnTarget === undefined) {
          // No data for this day
          break;
        }

        if (wasOnTarget) {
          currentStreak++;
        } else {
          // Streak broken
          break;
        }

        checkDate = checkDate.subtract(1, 'day');

        // Safety limit
        if (currentStreak > 365) break;
      }

      setStreak(currentStreak);
    };

    calculateStreak();
  }, [period]);

  return streak;
}
