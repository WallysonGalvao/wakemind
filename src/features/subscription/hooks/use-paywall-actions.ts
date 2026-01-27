import { useCallback } from 'react';

import { useRouter } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';

import { useSubscriptionStore } from '@/stores/use-subscription-store';

export type PlanType = 'yearly' | 'monthly' | 'lifetime';

interface UsePaywallActionsParams {
  selectedPlan: PlanType;
  monthlyPackage: PurchasesPackage | undefined;
  yearlyPackage: PurchasesPackage | undefined;
  lifetimePackage: PurchasesPackage | undefined;
}

/**
 * Encapsulates all paywall actions with proper memoization
 * Prevents unnecessary re-renders and race conditions
 */
export function usePaywallActions({
  selectedPlan,
  monthlyPackage,
  yearlyPackage,
  lifetimePackage,
}: UsePaywallActionsParams) {
  const router = useRouter();
  const { purchase, restore, refreshStatus } = useSubscriptionStore();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handlePurchase = useCallback(async () => {
    const selectedPackage =
      selectedPlan === 'yearly'
        ? yearlyPackage
        : selectedPlan === 'lifetime'
          ? lifetimePackage
          : monthlyPackage;

    if (!selectedPackage) {
      console.warn('[Paywall] No package selected');
      return;
    }

    const success = await purchase(selectedPackage);

    if (success) {
      await refreshStatus();
      router.back();
    }
  }, [
    selectedPlan,
    yearlyPackage,
    monthlyPackage,
    lifetimePackage,
    purchase,
    refreshStatus,
    router,
  ]);

  const handleRestore = useCallback(async () => {
    const success = await restore();

    if (success) {
      await refreshStatus();
      router.back();
    }
  }, [restore, refreshStatus, router]);

  return {
    handleClose,
    handlePurchase,
    handleRestore,
  };
}
