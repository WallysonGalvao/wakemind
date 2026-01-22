import { useMemo } from 'react';

import type { PurchasesPackage } from 'react-native-purchases';

export interface PaywallPackages {
  monthly: PurchasesPackage | undefined;
  yearly: PurchasesPackage | undefined;
}

/**
 * Hook to extract and memoize monthly and yearly packages from offerings
 * Prevents unnecessary recalculations on re-renders
 */
export function usePaywallPackages(offerings: PurchasesPackage[] | null): PaywallPackages {
  return useMemo(() => {
    if (!offerings?.length) {
      return { monthly: undefined, yearly: undefined };
    }

    const yearly = offerings.find(
      (pkg) => pkg.packageType === 'ANNUAL' || pkg.identifier.toLowerCase().includes('annual')
    );

    const monthly = offerings.find(
      (pkg) => pkg.packageType === 'MONTHLY' || pkg.identifier.toLowerCase().includes('monthly')
    );

    return { monthly, yearly };
  }, [offerings]);
}
