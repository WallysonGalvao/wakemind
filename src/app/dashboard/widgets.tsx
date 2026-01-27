import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const WidgetsScreen = lazy(() => import('@/features/dashboard/screens/widgets'));

export default function WidgetsPage() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <WidgetsScreen />
    </Suspense>
  );
}
