import { lazy, Suspense } from 'react';

import { LazyLoadingFallback } from '@/components/lazy-loading-fallback';

const BackupProtocolsInfoScreen = lazy(
  () => import('@/features/alarms/screens/backup-protocols-info')
);

export default function BackupProtocolsInfoRoute() {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <BackupProtocolsInfoScreen />
    </Suspense>
  );
}
