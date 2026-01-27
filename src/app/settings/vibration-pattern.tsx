import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const VibrationPatternScreen = lazy(() => import('@/features/settings/screens/vibration-pattern'));

export default function VibrationPatternRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <VibrationPatternScreen />
    </Suspense>
  );
}
