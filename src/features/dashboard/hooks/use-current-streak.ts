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
export function useCurrentStreak(refreshKey?: number): number {
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

      // Debug log for troubleshooting
      if (__DEV__ && records.length > 0) {
        console.log('[CurrentStreak] Records found:', records.length);
        console.log('[CurrentStreak] Sample record:', {
          targetTime: records[0].targetTime,
          actualTime: records[0].actualTime,
          date: records[0].date,
        });
      }

      if (records.length === 0) {
        setStreak(0);
        return;
      }

      // Group by date and check if each day met target
      const dailyResults = new Map<string, boolean>();

      records.forEach((record) => {
        // Normalize date to YYYY-MM-DD format
        const recordDate = dayjs(record.date);
        if (!recordDate.isValid()) return;
        const dateStr = recordDate.format('YYYY-MM-DD');

        // Parse targetTime (HH:mm format like "06:30")
        const targetMatch = record.targetTime.match(/(\d{1,2}):(\d{2})/);
        if (!targetMatch) return;
        const targetHour = parseInt(targetMatch[1], 10);
        const targetMin = parseInt(targetMatch[2], 10);
        const targetMinutes = targetHour * 60 + targetMin;

        // Parse actualTime (ISO string)
        const actual = dayjs(record.actualTime);
        if (!actual.isValid()) return;
        const actualMinutes = actual.hour() * 60 + actual.minute();

        // Calculate variance in minutes (using only time component)
        let varianceMinutes = actualMinutes - targetMinutes;

        // Handle time wrapping around midnight
        if (Math.abs(varianceMinutes) > 720) {
          varianceMinutes = varianceMinutes > 0 ? varianceMinutes - 1440 : varianceMinutes + 1440;
        }

        const variance = Math.abs(varianceMinutes);
        const onTarget = variance <= 10;

        // Mark day as on target if ANY completion that day was on target
        if (!dailyResults.has(dateStr) || onTarget) {
          dailyResults.set(dateStr, onTarget);
        }
      });

      // Calculate streak from today backwards
      let currentStreak = 0;
      let checkDate = now.startOf('day');

      // Start from today (include today's completion if exists)
      while (true) {
        const dateStr = checkDate.format('YYYY-MM-DD');
        const wasOnTarget = dailyResults.get(dateStr);

        if (wasOnTarget === undefined) {
          // No data for this day - only break if we haven't started the streak yet
          if (currentStreak === 0 && checkDate.isSame(now.startOf('day'), 'day')) {
            // Today has no data yet, try yesterday
            checkDate = checkDate.subtract(1, 'day');
            continue;
          }
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
  }, [refreshKey]);

  return streak;
}
