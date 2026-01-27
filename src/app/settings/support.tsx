import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const SupportScreen = lazy(() => import('@/features/settings/screens/support'));

export default function SupportRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <SupportScreen />
    </Suspense>
  );
}
