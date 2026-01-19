import { useCallback, useEffect, useState } from 'react';

import type { AlarmRecord } from '@/db/functions/alarms';
import * as alarmsDb from '@/db/functions/alarms';
import { sortAlarmsByTime } from '@/utils/alarm-sorting';

/**
 * Hook to get all alarms with reactive updates
 * Provides a clean interface for alarm operations with loading states
 */
export function useAlarms() {
  const [alarms, setAlarms] = useState<AlarmRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load alarms on mount
  useEffect(() => {
    let isMounted = true;

    async function loadAlarms() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await alarmsDb.getAlarms();
        if (isMounted) {
          setAlarms(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useAlarms] Error loading alarms:', err);
        if (isMounted) {
          setError(err as Error);
          setAlarms([]);
          setIsLoading(false);
        }
      }
    }

    loadAlarms();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sorted alarms (memoized via sortAlarmsByTime)
  const sortedAlarms = sortAlarmsByTime(alarms);

  // Get alarm by ID
  const getAlarmById = useCallback(
    (id: string) => {
      return alarms.find((alarm) => alarm.id === id);
    },
    [alarms]
  );

  // Refetch function for manual updates
  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await alarmsDb.getAlarms();
      setAlarms(data);
    } catch (err) {
      console.error('[useAlarms] Error loading alarms:', err);
      setError(err as Error);
      setAlarms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    alarms,
    sortedAlarms,
    isLoading,
    error,
    getAlarmById,
    refetch,
  };
}
