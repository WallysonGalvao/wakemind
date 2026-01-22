/**
 * RevenueCat Service
 * Handles all in-app purchase and subscription operations
 * Includes support for RevenueCat Paywall UI and Customer Center
 */

import Purchases, {
  type CustomerInfo,
  INTRO_ELIGIBILITY_STATUS,
  LOG_LEVEL,
  type PurchasesOfferings,
  type PurchasesPackage,
  type PurchasesStoreProduct,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import { AnalyticsEvents } from '@/analytics';
import { Entitlement, REVENUE_CAT_CONFIG } from '@/configs/revenue-cat';

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(): Promise<void> {
  try {
    if (!REVENUE_CAT_CONFIG.apiKey) {
      console.warn('[RevenueCat] API key not configured');
      return;
    }

    // Set log level
    if (REVENUE_CAT_CONFIG.enableDebugLogs) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure SDK
    Purchases.configure({
      apiKey: REVENUE_CAT_CONFIG.apiKey,
      appUserID: undefined, // Let RevenueCat generate anonymous ID
    });

    console.log('[RevenueCat] Initialized successfully');

    // Add listener for customer info updates
    Purchases.addCustomerInfoUpdateListener((info) => {
      console.log('[RevenueCat] Customer info updated:', info);
    });
  } catch (error) {
    console.error('[RevenueCat] Initialization error:', error);
  }
}

/**
 * Get current customer info
 * Includes active subscriptions and entitlements
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Error fetching customer info:', error);
    return null;
  }
}

/**
 * Check if user has active Pro subscription
 */
export async function isProUser(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    // Check if user has the 'pro' entitlement
    const hasProEntitlement = customerInfo.entitlements.active[Entitlement.PRO] !== undefined;

    return hasProEntitlement;
  } catch (error) {
    console.error('[RevenueCat] Error checking Pro status:', error);
    return false;
  }
}

/**
 * Get available offerings (subscription packages)
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  const startTime = Date.now();
  try {
    const offerings = await Purchases.getOfferings();
    const loadTime = Date.now() - startTime;
    console.log('[RevenueCat] Offerings fetched:', offerings);

    // Track successful load
    const offeringsCount = offerings.current?.availablePackages.length ?? 0;
    AnalyticsEvents.offeringsLoaded(offeringsCount, loadTime);

    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Error fetching offerings:', error);

    // Track failed load
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    AnalyticsEvents.offeringsLoadFailed(errorMessage);

    return null;
  }
}

/**
 * Get specific offering by ID
 */
export async function getOffering(offeringId: string): Promise<PurchasesPackage[] | null> {
  try {
    const offerings = await getOfferings();
    if (!offerings) return null;

    const offering = offerings.all[offeringId];
    if (!offering) {
      console.warn(`[RevenueCat] Offering '${offeringId}' not found`);
      return null;
    }

    return offering.availablePackages;
  } catch (error) {
    console.error('[RevenueCat] Error fetching offering:', error);
    return null;
  }
}

/**
 * Get current offering (default)
 */
export async function getCurrentOffering(): Promise<PurchasesPackage[] | null> {
  try {
    const offerings = await getOfferings();
    if (!offerings || !offerings.current) {
      console.warn('[RevenueCat] No current offering available');
      return null;
    }

    return offerings.current.availablePackages;
  } catch (error) {
    console.error('[RevenueCat] Error fetching current offering:', error);
    return null;
  }
}

/**
 * Purchase a package (subscription or one-time purchase)
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  const startTime = Date.now();

  try {
    console.log('[RevenueCat] Attempting purchase:', pkg.identifier);

    // Track purchase start
    AnalyticsEvents.purchaseStarted(pkg.identifier);

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const duration = Date.now() - startTime;

    console.log('[RevenueCat] Purchase successful:', customerInfo);

    // Track successful purchase
    AnalyticsEvents.purchaseCompleted(pkg.identifier, duration);
    AnalyticsEvents.subscriptionPurchased(
      pkg.identifier,
      pkg.product.priceString,
      pkg.product.subscriptionPeriod || 'lifetime'
    );

    return { success: true, customerInfo };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[RevenueCat] Purchase error:', error);

    const purchaseError = error as { userCancelled?: boolean; message?: string };

    // Handle user cancellation (not a real error)
    if (purchaseError.userCancelled) {
      console.log('[RevenueCat] User cancelled purchase');
      AnalyticsEvents.purchaseCancelled(pkg.identifier);
      return { success: false, error: 'cancelled' };
    }

    // Track failed purchase
    const errorMessage = purchaseError.message || 'Unknown error';
    AnalyticsEvents.subscriptionFailed(pkg.identifier, errorMessage);
    AnalyticsEvents.subscriptionError('purchase', errorMessage, {
      package_id: pkg.identifier,
      duration_ms: duration,
    });

    return { success: false, error: errorMessage || 'Purchase failed' };
  }
}

/**
 * Restore previous purchases
 * Important for iOS users who reinstall the app
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    console.log('[RevenueCat] Restoring purchases...');

    // Track restore start
    AnalyticsEvents.restoreStarted();

    const customerInfo = await Purchases.restorePurchases();
    const duration = Date.now() - startTime;

    console.log('[RevenueCat] Restore successful:', customerInfo);

    // Check if any active entitlements were restored
    const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;

    // Track successful restore
    AnalyticsEvents.restoreCompleted(duration, hasActiveEntitlements);

    if (hasActiveEntitlements) {
      AnalyticsEvents.subscriptionRestored();
    }

    return { success: true, customerInfo };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[RevenueCat] Restore error:', error);

    const restoreError = error as { message?: string };
    const errorMessage = restoreError.message || 'Restore failed';

    // Track failed restore
    AnalyticsEvents.subscriptionRestoreFailed(errorMessage);
    AnalyticsEvents.subscriptionError('restore', errorMessage, {
      duration_ms: duration,
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Get list of available products (without packages)
 */
export async function getProducts(productIds: string[]): Promise<PurchasesStoreProduct[] | null> {
  try {
    const products = await Purchases.getProducts(productIds);
    return products;
  } catch (error) {
    console.error('[RevenueCat] Error fetching products:', error);
    return null;
  }
}

/**
 * Check if user is eligible for intro offer
 * (Free trial or discounted intro pricing)
 */
export async function checkEligibility(productIds: string[]): Promise<Record<string, boolean>> {
  try {
    const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);

    const result: Record<string, boolean> = {};
    Object.keys(eligibility).forEach((productId) => {
      result[productId] =
        eligibility[productId].status ===
        INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
    });

    return result;
  } catch (error) {
    console.error('[RevenueCat] Error checking eligibility:', error);
    return {};
  }
}

/**
 * Set custom user attributes
 * Useful for analytics and targeting
 */
export async function setUserAttributes(attributes: Record<string, string | null>): Promise<void> {
  try {
    await Purchases.setAttributes(attributes);
    console.log('[RevenueCat] User attributes set:', attributes);
  } catch (error) {
    console.error('[RevenueCat] Error setting attributes:', error);
  }
}

/**
 * Identify user with custom ID
 * Call this after user logs in (if you have user accounts)
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('[RevenueCat] User identified:', userId, customerInfo);
  } catch (error) {
    console.error('[RevenueCat] Error identifying user:', error);
  }
}

/**
 * Log out current user (reset to anonymous)
 */
export async function logoutUser(): Promise<void> {
  try {
    const customerInfo = await Purchases.logOut();
    console.log('[RevenueCat] User logged out:', customerInfo);
  } catch (error) {
    console.error('[RevenueCat] Error logging out:', error);
  }
}

/**
 * Get formatted price for a product
 */
export function getFormattedPrice(product: PurchasesStoreProduct | PurchasesPackage): string {
  if ('product' in product) {
    return product.product.priceString;
  }
  return product.priceString;
}

/**
 * Get subscription period description
 */
export function getSubscriptionPeriod(
  product: PurchasesStoreProduct | PurchasesPackage
): string | null {
  if ('product' in product) {
    return product.product.subscriptionPeriod;
  }
  return product.subscriptionPeriod;
}

/**
 * Calculate savings for annual plan vs monthly
 */
export function calculateAnnualSavings(
  monthlyProduct: PurchasesStoreProduct,
  annualProduct: PurchasesStoreProduct
): number {
  const monthlyPrice = monthlyProduct.price;
  const annualPrice = annualProduct.price;
  const monthlyAnnualCost = monthlyPrice * 12;

  const savings = ((monthlyAnnualCost - annualPrice) / monthlyAnnualCost) * 100;

  return Math.round(savings);
}

// ============================================
// MODERN REVENUECAT PAYWALL UI
// ============================================

/**
 * Present RevenueCat's prebuilt paywall UI
 * This uses RevenueCat's hosted paywall configuration from the dashboard
 *
 * @param options Configuration options
 * @returns PaywallResult with purchase status
 *
 * @example
 * const result = await presentPaywallUI({
 *   requiredEntitlement: 'WakeMind Pro',
 *   offering: 'default'
 * });
 *
 * if (result.userCancelled) {
 *   console.log('User closed paywall');
 * } else {
 *   console.log('Purchase completed!');
 * }
 */
export async function presentPaywallUI(options?: {
  offering?: PurchasesOfferings | null;
  displayCloseButton?: boolean;
}): Promise<PAYWALL_RESULT> {
  try {
    console.log('[RevenueCat Paywall] Presenting paywall...', options);

    const result = await RevenueCatUI.presentPaywall({
      offering: options?.offering?.current ?? undefined,
      displayCloseButton: options?.displayCloseButton ?? true,
    });

    console.log('[RevenueCat Paywall] Result:', result);

    // Track based on result
    if (result !== PAYWALL_RESULT.CANCELLED && result !== PAYWALL_RESULT.NOT_PRESENTED) {
      AnalyticsEvents.subscriptionPurchased(
        'paywall_ui',
        'unknown', // Price not available from PAYWALL_RESULT
        'unknown'
      );
    }

    return result;
  } catch (error) {
    const paywallError = error as Error;
    throw paywallError;
  }
}

/**
 * Present paywall only if user doesn't have the entitlement
 * Automatically checks entitlement status before showing
 *
 * @param options Configuration options
 * @returns PaywallResult or null if user already has entitlement
 *
 * @example
 * const result = await presentPaywallIfUserNeedsPro();
 * if (result === null) {
 *   console.log('User already has Pro!');
 *   return;
 * }
 */
export async function presentPaywallIfUserNeedsPro(_options?: {
  offering?: PurchasesOfferings | null;
}): Promise<PAYWALL_RESULT | null> {
  try {
    const isPro = await isProUser();

    if (isPro) {
      console.log('[RevenueCat Paywall] User already has Pro, skipping paywall');
      return null;
    }

    return await presentPaywallUI({});
  } catch (error) {
    console.error('[RevenueCat Paywall] Error:', error);
    throw error;
  }
}

/**
 * Present paywall only if needed (using RevenueCat's built-in check)
 * This is the most convenient method - RevenueCat handles everything
 *
 * @example
 * const result = await showPaywallIfNeeded();
 */
export async function showPaywallIfNeeded(options?: {
  requiredEntitlement?: string;
  offering?: PurchasesOfferings | null;
}): Promise<PAYWALL_RESULT> {
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: options?.requiredEntitlement || Entitlement.PRO,
      offering: options?.offering?.current ?? undefined,
    });

    console.log('[RevenueCat Paywall] Result:', result);
    return result;
  } catch (error) {
    console.error('[RevenueCat Paywall] Error:', error);
    throw error;
  }
}

// ============================================
// CUSTOMER CENTER (Subscription Management)
// ============================================

/**
 * Check if Customer Center is available
 * Customer Center requires configuration in RevenueCat dashboard
 */
export async function isCustomerCenterAvailable(): Promise<boolean> {
  try {
    // Customer Center is available if user has active subscriptions
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    const hasActiveSubscriptions = Object.keys(customerInfo.entitlements.active).length > 0;
    return hasActiveSubscriptions;
  } catch (error) {
    console.error('[RevenueCat] Error checking Customer Center availability:', error);
    return false;
  }
}

/**
 * Get subscription management URL
 * Directs users to platform-specific subscription management
 * - iOS: App Store subscriptions page
 * - Android: Google Play subscriptions page
 */
export async function getManageSubscriptionURL(): Promise<string | null> {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return null;

    // Get the management URL from customer info
    return customerInfo.managementURL ?? null;
  } catch (error) {
    console.error('[RevenueCat] Error getting management URL:', error);
    return null;
  }
}

/**
 * Helper to parse PaywallResult
 */
export function parsePaywallResult(result: PAYWALL_RESULT): {
  purchased: boolean;
  cancelled: boolean;
  restored: boolean;
  error: boolean;
} {
  return {
    purchased: result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED,
    cancelled: result === PAYWALL_RESULT.CANCELLED,
    restored: result === PAYWALL_RESULT.RESTORED,
    error: result === PAYWALL_RESULT.ERROR,
  };
}

/**
 * Get active subscription details
 */
export async function getActiveSubscription(): Promise<{
  productId: string | null;
  expirationDate: string | null;
  willRenew: boolean;
  periodType: string | null;
} | null> {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return null;

    const proEntitlement = customerInfo.entitlements.active[Entitlement.PRO];
    if (!proEntitlement) return null;

    return {
      productId: proEntitlement.productIdentifier,
      expirationDate: proEntitlement.expirationDate,
      willRenew: proEntitlement.willRenew,
      periodType: proEntitlement.periodType ?? null,
    };
  } catch (error) {
    console.error('[RevenueCat] Error getting active subscription:', error);
    return null;
  }
}
