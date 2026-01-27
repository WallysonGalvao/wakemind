import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const AchievementHistoryScreen = lazy(
  () => import('@/features/achievements/screens/achievement-history-screen')
);

export default function AchievementHistoryRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <AchievementHistoryScreen />
    </Suspense>
  );
}
