import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const ExecutionScoreInfoScreen = lazy(
  () => import('@/features/dashboard/components/widgets/execution-score-info')
);

export default function ExecutionScoreInfoPage() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <ExecutionScoreInfoScreen />
    </Suspense>
  );
}
