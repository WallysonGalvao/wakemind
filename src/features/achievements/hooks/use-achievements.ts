import { useEffect, useState } from 'react';

import type { AchievementState } from '../types/achievement.types';

import * as achievementService from '@/db/functions/achievements';

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await achievementService.getAllAchievementsWithStatus();
      setAchievements(data);
    } catch (err) {
      setError(err as Error);
      console.error('[useAchievements] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const refetch = () => {
    fetchAchievements();
  };

  return {
    achievements,
    loading,
    error,
    refetch,
  };
}
