import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { desc } from 'drizzle-orm';

import { db } from '@/db';
import { goals } from '@/db/schema';

export interface GoalProgress {
  id: string;
  type: 'streak' | 'execution_score' | 'latency_reduction';
  target: number;
  currentValue: number;
  progress: number; // Percentage 0-100
  isCompleted: boolean;
  daysRemaining: number | null;
  title: string;
  icon: string;
}

/**
 * Fetch all active goals and their progress
 */
export function useGoalProgress(refreshKey?: number): GoalProgress[] {
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
      // Fetch all goals, prioritizing incomplete ones
      const allGoals = await db.select().from(goals).orderBy(desc(goals.createdAt));

      if (allGoals.length === 0) {
        setGoalProgress([]);
        return;
      }

      const now = dayjs();

      const progressData: GoalProgress[] = allGoals.map((goal) => {
        // Calculate progress percentage
        const progress = Math.min((goal.currentValue / goal.target) * 100, 100);

        // Calculate days remaining if there's an end date
        let daysRemaining: number | null = null;
        if (goal.endDate) {
          const endDate = dayjs(goal.endDate);
          daysRemaining = endDate.diff(now, 'day');
        }

        // Determine title and icon based on goal type
        let title = '';
        let icon = '';

        switch (goal.type) {
          case 'streak':
            title = 'dashboard.goals.streak';
            icon = 'local_fire_department';
            break;
          case 'execution_score':
            title = 'dashboard.goals.executionScore';
            icon = 'target';
            break;
          case 'latency_reduction':
            title = 'dashboard.goals.latencyReduction';
            icon = 'speed';
            break;
          default:
            title = 'dashboard.goals.custom';
            icon = 'flag';
        }

        return {
          id: goal.id,
          type: goal.type as 'streak' | 'execution_score' | 'latency_reduction',
          target: goal.target,
          currentValue: goal.currentValue,
          progress: Math.round(progress),
          isCompleted: goal.isCompleted,
          daysRemaining,
          title,
          icon,
        };
      });

      setGoalProgress(progressData);
    };

    fetchGoals();
  }, [refreshKey]);

  return goalProgress;
}
