import { useMemo } from 'react';

import type { PurchasesPackage } from 'react-native-purchases';

export interface PricingSavings {
  originalPrice: string;
  savings: string;
  savingsPercent: number;
}

/**
 * Calculates yearly savings based on monthly and yearly packages
 * Memoized to prevent recalculation on every render
 */
export function usePricingSavings(
  monthlyPackage: PurchasesPackage | undefined,
  yearlyPackage: PurchasesPackage | undefined
): PricingSavings {
  return useMemo(() => {
    const defaultResult: PricingSavings = {
      originalPrice: '',
      savings: '',
      savingsPercent: 0,
    };

    if (!monthlyPackage || !yearlyPackage) {
      return defaultResult;
    }

    const monthlyPrice = monthlyPackage.product.price;
    const yearlyPrice = yearlyPackage.product.price;
    const yearlyAsMonthly = monthlyPrice * 12;

    // Validate prices to prevent division by zero
    if (yearlyAsMonthly <= 0) {
      return defaultResult;
    }

    // Calculate savings percentage
    const savingsPercent = Math.round(((yearlyAsMonthly - yearlyPrice) / yearlyAsMonthly) * 100);

    // Format original price (monthly × 12)
    const currencyCode = monthlyPackage.product.currencyCode || 'USD';
    const originalPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(yearlyAsMonthly);

    return {
      originalPrice,
      savings: `${savingsPercent}%`,
      savingsPercent,
    };
  }, [monthlyPackage, yearlyPackage]);
}

/**
 * Formats price from a package
 * Returns fallback for undefined packages
 */
export function formatPackagePrice(pkg: PurchasesPackage | undefined): string {
  return pkg?.product.priceString ?? '$0.00';
}
