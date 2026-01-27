import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const PrivacyPolicyScreen = lazy(() => import('@/features/settings/screens/privacy-policy'));

export default function PrivacyPolicyRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <PrivacyPolicyScreen />
    </Suspense>
  );
}
