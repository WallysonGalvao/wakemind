import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const PaywallScreen = lazy(() => import('@/features/subscription/screens/paywall'));

export default function PaywallRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <PaywallScreen />
    </Suspense>
  );
}
