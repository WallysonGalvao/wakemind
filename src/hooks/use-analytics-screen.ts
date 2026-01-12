import { useEffect, useRef } from 'react';

import { logScreenView } from '@/analytics';

/**
 * Hook to track screen views in Firebase Analytics
 * @param screenName - The name of the screen to track
 */
export function useAnalyticsScreen(screenName: string) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      logScreenView(screenName);
      hasTracked.current = true;
    }
  }, [screenName]);
}
