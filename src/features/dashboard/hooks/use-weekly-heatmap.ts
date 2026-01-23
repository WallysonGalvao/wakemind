import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc, gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';
import { calculateExecutionScore } from '@/utils/cognitive-score';

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  isEmpty: boolean; // True if no data for this day
}

/**
 * Generate heatmap data for the last 28 days (4 weeks)
 * Each day shows the execution score
 */
export function useWeeklyHeatmap(refreshKey?: number): HeatmapDay[] {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    const generateHeatmap = async () => {
      const now = dayjs();
      const startDate = now.subtract(27, 'day').startOf('day'); // Last 28 days

      // Fetch all completions for the period
      const completions = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')))
        .orderBy(desc(alarmCompletions.date));

      // Group by date and calculate daily execution score
      const dailyScores = new Map<string, number>();

      completions.forEach((completion) => {
        const date = dayjs(completion.date).format('YYYY-MM-DD');

        if (!dailyScores.has(date)) {
          // Calculate execution score for this completion
          const score = calculateExecutionScore({
            cognitiveScore: completion.cognitiveScore,
            reactionTime: completion.reactionTime,
            targetTime: completion.targetTime,
            actualTime: completion.actualTime,
          });

          dailyScores.set(date, score);
        }
      });

      // Generate array of 28 days
      const heatmap: HeatmapDay[] = [];

      for (let i = 27; i >= 0; i--) {
        const date = now.subtract(i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        const score = dailyScores.get(dateStr);

        heatmap.push({
          date: dateStr,
          score: score ?? 0,
          isEmpty: score === undefined,
        });
      }

      setHeatmapData(heatmap);
    };

    generateHeatmap();
  }, [refreshKey]);

  return heatmapData;
}
