import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const AlarmToneScreen = lazy(() => import('@/features/settings/screens/alarm-tone'));

export default function AlarmToneRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <AlarmToneScreen />
    </Suspense>
  );
}
