/**
 * Subscription Store
 * Zustand store for managing subscription state
 */

import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { create } from 'zustand';

import { AnalyticsEvents } from '@/analytics';
import { getFeatureAccess } from '@/configs/revenue-cat';
import * as RevenueCatService from '@/services/revenue-cat-service';
import { retryRevenueCatOperation } from '@/utils/retry';

// Loading states for granular UI feedback
export type LoadingState = 'idle' | 'initializing' | 'loading' | 'purchasing' | 'restoring';

interface SubscriptionState {
  // State
  isPro: boolean;
  loadingState: LoadingState;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesPackage[] | null;
  error: string | null;

  // Computed
  featureAccess: ReturnType<typeof getFeatureAccess>;
  isLoading: boolean; // Backwards compatibility - true if any loading state is active

  // Actions
  initialize: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  showPaywall: (offering?: string) => Promise<boolean>;
  showPaywallIfNeeded: (offering?: string) => Promise<boolean>;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  isPro: false,
  loadingState: 'idle',
  customerInfo: null,
  offerings: null,
  error: null,

  // Computed
  featureAccess: getFeatureAccess(false),
  isLoading: false,

  // Initialize RevenueCat and load data
  initialize: async () => {
    set({ loadingState: 'initializing', isLoading: true, error: null });

    try {
      // Initialize SDK with retry
      await retryRevenueCatOperation(() => RevenueCatService.initializeRevenueCat(), 'initialize');

      // Load customer info
      await get().refreshStatus();

      // Load offerings
      await get().loadOfferings();

      set({ loadingState: 'idle', isLoading: false });
    } catch (error: unknown) {
      console.error('[SubscriptionStore] Initialization error:', error);
      set({
        loadingState: 'idle',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize subscriptions',
      });
    }
  },

  // Refresh subscription status
  refreshStatus: async () => {
    try {
      const customerInfo = await retryRevenueCatOperation(
        () => RevenueCatService.getCustomerInfo(),
        'getCustomerInfo'
      );
      const isPro = await RevenueCatService.isProUser();

      set({
        customerInfo,
        isPro,
        featureAccess: getFeatureAccess(isPro),
        error: null,
      });

      // Track customer info refresh
      AnalyticsEvents.customerInfoRefreshed(isPro);
    } catch (error: unknown) {
      console.error('[SubscriptionStore] Refresh status error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh subscription status',
      });
    }
  },

  // Load available offerings
  loadOfferings: async () => {
    set({ loadingState: 'loading', isLoading: true });

    try {
      const offerings = await retryRevenueCatOperation(
        () => RevenueCatService.getCurrentOffering(),
        'loadOfferings'
      );
      set({ offerings, error: null, loadingState: 'idle', isLoading: false });
    } catch (error: unknown) {
      console.error('[SubscriptionStore] Load offerings error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load offerings',
        isLoading: false,
      });
    }
  },

  // Purchase a package
  purchase: async (pkg: PurchasesPackage) => {
    set({ loadingState: 'purchasing', isLoading: true, error: null });

    try {
      const result = await RevenueCatService.purchasePackage(pkg);

      if (result.success && result.customerInfo) {
        const isPro = await RevenueCatService.isProUser();

        set({
          customerInfo: result.customerInfo,
          isPro,
          featureAccess: getFeatureAccess(isPro),
          loadingState: 'idle',
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        set({
          loadingState: 'idle',
          isLoading: false,
          error: result.error === 'cancelled' ? null : result.error || 'Purchase failed',
        });

        return false;
      }
    } catch (error: unknown) {
      console.error('[SubscriptionStore] Purchase error:', error);
      set({
        loadingState: 'idle',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      });

      return false;
    }
  },

  // Restore purchases
  restore: async () => {
    set({ loadingState: 'restoring', isLoading: true, error: null });

    try {
      const result = await retryRevenueCatOperation(
        () => RevenueCatService.restorePurchases(),
        'restore'
      );

      if (result.success && result.customerInfo) {
        const isPro = await RevenueCatService.isProUser();

        set({
          customerInfo: result.customerInfo,
          isPro,
          featureAccess: getFeatureAccess(isPro),
          loadingState: 'idle',
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        set({
          loadingState: 'idle',
          isLoading: false,
          error: result.error || 'Restore failed',
        });

        return false;
      }
    } catch (error: unknown) {
      console.error('[SubscriptionStore] Restore error:', error);
      set({
        loadingState: 'idle',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      });

      return false;
    }
  },

  // Show RevenueCat Paywall UI
  showPaywall: async (_offering?: string) => {
    set({ loadingState: 'loading', isLoading: true, error: null });

    try {
      const result = await RevenueCatService.presentPaywallUI({});

      // Refresh status after paywall closes
      await get().refreshStatus();

      set({ loadingState: 'idle', isLoading: false });

      // Return true if user made a purchase or restored
      const purchased = result === 'PURCHASED' || result === 'RESTORED';
      return purchased;
    } catch (error) {
      const err = error as Error;
      console.error('[SubscriptionStore] Paywall error:', err);
      set({
        loadingState: 'idle',
        isLoading: false,
        error: err.message || 'Failed to show paywall',
      });

      return false;
    }
  },

  // Show paywall only if user doesn't have Pro
  showPaywallIfNeeded: async (offering?: string) => {
    const { isPro } = get();

    if (isPro) {
      console.log('[SubscriptionStore] User already has Pro');
      return false;
    }

    return get().showPaywall(offering);
  },

  // Reset store to initial state
  reset: () => {
    set({
      isPro: false,
      loadingState: 'idle',
      isLoading: false,
      customerInfo: null,
      offerings: null,
      error: null,
      featureAccess: getFeatureAccess(false),
    });
  },
}));
