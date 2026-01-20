import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';
import type { PeriodType } from '@/features/dashboard/types';

// Get number of days based on period
function getDaysForPeriod(period: PeriodType): number {
  switch (period) {
    case 'day':
      return 1; // Current day only
    case 'week':
      return 7; // Last 7 days
    case 'month':
      return 30; // Last 30 days
    case 'custom':
    default:
      return 14; // Last 14 days for custom
  }
}

/**
 * Calculate average latency (time to stand up) after alarm completion
 * Latency = time between alarm completion and actual wake time
 */
export function useAvgLatency(period: PeriodType = 'month'): number {
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    const calculateLatency = async () => {
      const now = dayjs();
      const numDays = getDaysForPeriod(period);
      const startDate = now.subtract(numDays - 1, 'day').startOf('day');

      // Fetch all completions in the period
      const records = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')));

      if (records.length === 0) {
        setLatency(0);
        return;
      }

      // Calculate average reaction time for challenge completion
      // Note: reactionTime represents time to complete the cognitive challenge,
      // not the time to stand up from bed (which is not currently tracked)
      const latencies = records
        .map((record) => {
          // reactionTime is in milliseconds
          // Convert to minutes
          return record.reactionTime / (1000 * 60);
        })
        .filter((l) => l > 0); // Filter out invalid/zero values

      if (latencies.length === 0) {
        setLatency(0);
        return;
      }

      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;

      // Round to nearest minute
      setLatency(Math.round(avgLatency));
    };

    calculateLatency();
  }, [period]);

  return latency;
}
