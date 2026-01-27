import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const CognitiveActivationInfoScreen = lazy(
  () => import('@/features/dashboard/components/widgets/cognitive-activation-info')
);

export default function CognitiveActivationInfoPage() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <CognitiveActivationInfoScreen />
    </Suspense>
  );
}
