import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc, gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';

/**
 * Calculate current streak of consecutive days meeting wake time target
 * A day is "on target" if the user woke up within acceptable variance
 * Note: Always looks back 90 days regardless of period parameter
 */
export function useCurrentStreak(): number {
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

        // Parse times with fallback for different formats
        let target = dayjs(record.targetTime);
        if (!target.isValid()) {
          target = dayjs(record.targetTime, 'HH:mm');
        }

        let actual = dayjs(record.actualTime);
        if (!actual.isValid()) {
          actual = dayjs(record.actualTime, 'HH:mm');
        }

        // Calculate variance in minutes
        // Handle time wrapping (e.g., target 23:00, actual 00:30 should be 90min, not 1350min)
        let varianceMinutes = actual.diff(target, 'minute');

        // If difference is more than 12 hours, it likely wrapped around midnight
        if (Math.abs(varianceMinutes) > 720) {
          varianceMinutes = varianceMinutes > 0 ? varianceMinutes - 1440 : varianceMinutes + 1440;
        }

        const variance = Math.abs(varianceMinutes);
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
  }, []);

  return streak;
}
