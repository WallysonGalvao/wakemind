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

/**
 * Gets intro offer information from a package
 * Returns intro price, period, and parsed values for i18n
 */
export function getIntroOffer(pkg: PurchasesPackage | undefined): {
  hasIntroOffer: boolean;
  introPrice: string | null;
  introPeriod: string | null;
  periodValue: number; // e.g., 3 for "3 months"
  periodUnit: 'day' | 'week' | 'month' | 'year' | null; // Unit for i18n pluralization
} {
  if (!pkg || !pkg.product.introPrice) {
    return {
      hasIntroOffer: false,
      introPrice: null,
      introPeriod: null,
      periodValue: 0,
      periodUnit: null,
    };
  }

  const intro = pkg.product.introPrice;

  // Parse ISO 8601 period format (e.g., "P3M" = 3 months, "P1Y" = 1 year)
  const period = intro.period || '';
  let periodValue = 0;
  let periodUnit: 'day' | 'week' | 'month' | 'year' | null = null;

  if (period) {
    const match = period.match(/P(\d+)([DWMY])/);
    if (match) {
      periodValue = parseInt(match[1], 10);
      const unit = match[2];

      switch (unit) {
        case 'D':
          periodUnit = 'day';
          break;
        case 'W':
          periodUnit = 'week';
          break;
        case 'M':
          periodUnit = 'month';
          break;
        case 'Y':
          periodUnit = 'year';
          break;
      }
    }
  }

  return {
    hasIntroOffer: true,
    introPrice: intro.priceString,
    introPeriod: period,
    periodValue,
    periodUnit,
  };
}
