import { useEffect, useRef } from 'react';

import { logScreenView } from '@/analytics';

/**
 * Hook to automatically track screen views in Mixpanel Analytics
 * Call this hook at the top of your screen component
 *
 * @param screenName - The name of the screen to track
 * @param properties - Optional additional properties to track with the screen view
 *
 * @example
 * ```tsx
 * function MyScreen() {
 *   useAnalyticsScreen('My Screen');
 *   // or with properties
 *   useAnalyticsScreen('Product Detail', { product_id: '123' });
 *   return <View>...</View>;
 * }
 * ```
 */
export function useAnalyticsScreen(
  screenName: string,
  properties?: Record<string, string | number | boolean>
) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      logScreenView(screenName, properties);
      hasTracked.current = true;
    }
  }, [screenName, properties]);
}
