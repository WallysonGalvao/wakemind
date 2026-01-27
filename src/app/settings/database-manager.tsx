import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const DatabaseManagerScreen = lazy(() => import('@/features/settings/screens/database-manager'));

export default function DatabaseManagerRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <DatabaseManagerScreen />
    </Suspense>
  );
}
