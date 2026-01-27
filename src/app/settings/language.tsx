import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const LanguageScreen = lazy(() => import('@/features/settings/screens/language'));

export default function LanguageRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <LanguageScreen />
    </Suspense>
  );
}
