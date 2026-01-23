import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { eq, gte } from 'drizzle-orm';

import { db } from '@/db';
import { routineCompletions, routineItems } from '@/db/schema';

export interface RoutineItemData {
  id: string;
  title: string;
  icon: string;
  order: number;
  isCompleted: boolean;
  isEnabled: boolean;
}

export interface RoutineStats {
  todayProgress: number; // Percentage 0-100
  weeklyAverage: number; // Percentage 0-100
  currentStreak: number; // Days with 100% completion
}

/**
 * Fetch morning routine checklist items and completion status
 */
export function useMorningRoutine(refreshKey?: number): {
  items: RoutineItemData[];
  stats: RoutineStats;
} {
  const [items, setItems] = useState<RoutineItemData[]>([]);
  const [stats, setStats] = useState<RoutineStats>({
    todayProgress: 0,
    weeklyAverage: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    const fetchRoutine = async () => {
      // Fetch all routine items
      const allItems = await db.select().from(routineItems);

      if (allItems.length === 0) {
        // Create default routine items if none exist
        const defaultItems = [
          { id: '1', title: 'Drink water', icon: 'water_drop', order: 1, isEnabled: true },
          { id: '2', title: 'Exercise', icon: 'exercise', order: 2, isEnabled: true },
          { id: '3', title: 'Breakfast', icon: 'restaurant', order: 3, isEnabled: true },
          { id: '4', title: 'Meditation', icon: 'self_improvement', order: 4, isEnabled: true },
        ];

        // Note: In production, these should be inserted into DB
        setItems(
          defaultItems.map((item) => ({
            ...item,
            isCompleted: false,
            createdAt: dayjs().toISOString(),
            updatedAt: dayjs().toISOString(),
          }))
        );
        return;
      }

      // Get today's date
      const today = dayjs().format('YYYY-MM-DD');

      // Fetch today's completions
      const todayCompletions = await db
        .select()
        .from(routineCompletions)
        .where(eq(routineCompletions.date, today));

      const completedIds = new Set(todayCompletions.map((c) => c.routineItemId));

      // Map items with completion status
      const itemsData: RoutineItemData[] = allItems
        .filter((item) => item.isEnabled)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          id: item.id,
          title: item.title,
          icon: item.icon,
          order: item.order,
          isCompleted: completedIds.has(item.id),
          isEnabled: item.isEnabled,
        }));

      // Calculate today's progress
      const enabledCount = itemsData.length;
      const completedCount = itemsData.filter((i) => i.isCompleted).length;
      const todayProgress = enabledCount > 0 ? (completedCount / enabledCount) * 100 : 0;

      // Calculate weekly average
      const weekStart = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      const weekCompletions = await db
        .select()
        .from(routineCompletions)
        .where(gte(routineCompletions.date, weekStart));

      // Group by date
      const dailyCompletions = new Map<string, Set<string>>();
      weekCompletions.forEach((c) => {
        if (!dailyCompletions.has(c.date)) {
          dailyCompletions.set(c.date, new Set());
        }
        dailyCompletions.get(c.date)!.add(c.routineItemId);
      });

      // Calculate average
      let weeklyTotal = 0;
      for (let i = 0; i < 7; i++) {
        const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        const dayCompletions = dailyCompletions.get(date)?.size ?? 0;
        weeklyTotal += enabledCount > 0 ? (dayCompletions / enabledCount) * 100 : 0;
      }
      const weeklyAverage = weeklyTotal / 7;

      // Calculate streak (consecutive days with 100% completion)
      let currentStreak = 0;
      for (let i = 0; i < 90; i++) {
        const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        const dayCompletions = dailyCompletions.get(date)?.size ?? 0;
        if (dayCompletions === enabledCount && enabledCount > 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      setItems(itemsData);
      setStats({
        todayProgress: Math.round(todayProgress),
        weeklyAverage: Math.round(weeklyAverage),
        currentStreak,
      });
    };

    fetchRoutine();
  }, [refreshKey]);

  return { items, stats };
}
