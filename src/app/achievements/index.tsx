import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const AchievementsScreen = lazy(
  () => import('@/features/achievements/screens/achievements-screen')
);

export default function AchievementsRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <AchievementsScreen />
    </Suspense>
  );
}
