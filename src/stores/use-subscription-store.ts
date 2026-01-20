/**
 * Subscription Store
 * Zustand store for managing subscription state
 */

import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { create } from 'zustand';

import { getFeatureAccess } from '@/configs/revenue-cat';
import * as RevenueCatService from '@/services/revenue-cat-service';

interface SubscriptionState {
  // State
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesPackage[] | null;
  error: string | null;

  // Computed
  featureAccess: ReturnType<typeof getFeatureAccess>;

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
  isLoading: false,
  customerInfo: null,
  offerings: null,
  error: null,

  // Computed
  featureAccess: getFeatureAccess(false),

  // Initialize RevenueCat and load data
  initialize: async () => {
    set({ isLoading: true, error: null });

    try {
      // Initialize SDK
      await RevenueCatService.initializeRevenueCat();

      // Load customer info
      await get().refreshStatus();

      // Load offerings
      await get().loadOfferings();

      set({ isLoading: false });
    } catch (error: any) {
      console.error('[SubscriptionStore] Initialization error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to initialize subscriptions',
      });
    }
  },

  // Refresh subscription status
  refreshStatus: async () => {
    try {
      const customerInfo = await RevenueCatService.getCustomerInfo();
      const isPro = await RevenueCatService.isProUser();

      set({
        customerInfo,
        isPro,
        featureAccess: getFeatureAccess(isPro),
        error: null,
      });
    } catch (error: any) {
      console.error('[SubscriptionStore] Refresh status error:', error);
      set({ error: error.message || 'Failed to refresh subscription status' });
    }
  },

  // Load available offerings
  loadOfferings: async () => {
    try {
      const offerings = await RevenueCatService.getCurrentOffering();
      set({ offerings, error: null });
    } catch (error: any) {
      console.error('[SubscriptionStore] Load offerings error:', error);
      set({ error: error.message || 'Failed to load offerings' });
    }
  },

  // Purchase a package
  purchase: async (pkg: PurchasesPackage) => {
    set({ isLoading: true, error: null });

    try {
      const result = await RevenueCatService.purchasePackage(pkg);

      if (result.success && result.customerInfo) {
        const isPro = await RevenueCatService.isProUser();

        set({
          customerInfo: result.customerInfo,
          isPro,
          featureAccess: getFeatureAccess(isPro),
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        set({
          isLoading: false,
          error: result.error === 'cancelled' ? null : result.error || 'Purchase failed',
        });

        return false;
      }
    } catch (error: any) {
      console.error('[SubscriptionStore] Purchase error:', error);
      set({
        isLoading: false,
        error: error.message || 'Purchase failed',
      });

      return false;
    }
  },

  // Restore purchases
  restore: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await RevenueCatService.restorePurchases();

      if (result.success && result.customerInfo) {
        const isPro = await RevenueCatService.isProUser();

        set({
          customerInfo: result.customerInfo,
          isPro,
          featureAccess: getFeatureAccess(isPro),
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        set({
          isLoading: false,
          error: result.error || 'Restore failed',
        });

        return false;
      }
    } catch (error: any) {
      console.error('[SubscriptionStore] Restore error:', error);
      set({
        isLoading: false,
        error: error.message || 'Restore failed',
      });

      return false;
    }
  },

  // Show RevenueCat Paywall UI
  showPaywall: async (offering?: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await RevenueCatService.presentPaywallUI({ offering: offering as any });

      // Refresh status after paywall closes
      await get().refreshStatus();

      set({ isLoading: false });

      // Return true if user made a purchase or restored
      const purchased = result === 'PURCHASED' || result === 'RESTORED';
      return purchased;
    } catch (error) {
      const err = error as Error;
      console.error('[SubscriptionStore] Paywall error:', err);
      set({
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
      isLoading: false,
      customerInfo: null,
      offerings: null,
      error: null,
      featureAccess: getFeatureAccess(false),
    });
  },
}));
