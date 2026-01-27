import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const WakeConsistencyInfoScreen = lazy(
  () => import('@/features/dashboard/components/widgets/wake-consistency-info')
);

export default function WakeConsistencyInfoPage() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <WakeConsistencyInfoScreen />
    </Suspense>
  );
}
