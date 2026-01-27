import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const PerformanceSummaryScreen = lazy(
  () => import('@/features/performance/screens/morning-performance-summary-screen')
);

export default function PerformanceSummaryRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <PerformanceSummaryScreen />
    </Suspense>
  );
}
