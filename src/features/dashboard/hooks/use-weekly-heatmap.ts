import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc, gte } from 'drizzle-orm';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  isEmpty: boolean; // True if no data for this day
}

/**
 * Generate heatmap data for the last 28 days (4 weeks)
 * Each day shows the execution score
 * Weeks start on Monday
 */
export function useWeeklyHeatmap(refreshKey?: number): HeatmapDay[] {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    const generateHeatmap = async () => {
      const now = dayjs();

      // Calculate the most recent Monday (or today if it's Monday)
      const dayOfWeek = now.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
      const lastMonday = now.subtract(daysToMonday, 'day').startOf('day');

      // Start from 3 weeks before Monday, ending at Sunday of current week (28 days total)
      const startDate = lastMonday.subtract(21, 'day').startOf('day');
      const endDate = lastMonday.add(6, 'day').endOf('day'); // Sunday of current week

      console.log('[WeeklyHeatmap] Generating heatmap from:', startDate.format('YYYY-MM-DD'));
      console.log('[WeeklyHeatmap] To:', endDate.format('YYYY-MM-DD'));
      console.log('[WeeklyHeatmap] Last Monday:', lastMonday.format('YYYY-MM-DD'));

      // Fetch all completions for the period
      const completions = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')))
        .orderBy(desc(alarmCompletions.date));

      console.log('[WeeklyHeatmap] Found completions:', completions.length);
      if (completions.length > 0) {
        console.log('[WeeklyHeatmap] Sample completion:', completions[0]);
      }

      // Group by date and calculate daily execution score
      const dailyScores = new Map<string, number>();

      completions.forEach((completion, index) => {
        const date = dayjs(completion.date).format('YYYY-MM-DD');

        if (!dailyScores.has(date)) {
          // Use cognitive score directly as the daily score
          const score = completion.cognitiveScore;

          if (index === 0) {
            console.log('[WeeklyHeatmap] First score:', score, 'for date:', date);
          }

          dailyScores.set(date, score);
        }
      });

      // Generate array of 28 days starting from the Monday
      const heatmap: HeatmapDay[] = [];

      for (let i = 0; i < 28; i++) {
        const date = startDate.add(i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        const score = dailyScores.get(dateStr);

        heatmap.push({
          date: dateStr,
          score: score ?? 0,
          isEmpty: score === undefined,
        });
      }

      console.log('[WeeklyHeatmap] Daily scores calculated:', dailyScores.size);
      console.log('[WeeklyHeatmap] Heatmap data generated:', heatmap.length, 'days');

      setHeatmapData(heatmap);
    };

    generateHeatmap();
  }, [refreshKey]);

  return heatmapData;
}
