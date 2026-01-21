import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { FeatureRow, ProBadge } from '../components/paywall-features';
import { PaywallFooter } from '../components/paywall-footer';
import { usePaywallHeader } from '../components/paywall-header';
import { MonthlyPricingCard, YearlyPricingCard } from '../components/paywall-pricing-cards';
import { PRO_FEATURES } from '../constants/pro-features';
import type { PlanType } from '../hooks/use-paywall-actions';
import { usePaywallActions } from '../hooks/use-paywall-actions';
import { usePaywallPackages } from '../hooks/use-paywall-packages';
import { formatPackagePrice, usePricingSavings } from '../hooks/use-pricing-calculations';

import { Text } from '@/components/ui/text';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { offerings, isLoading, loadOfferings } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  // Extract packages from offerings (memoized)
  const { monthly: monthlyPackage, yearly: yearlyPackage } = usePaywallPackages(offerings);

  // Calculate pricing savings (memoized)
  const yearlySavings = usePricingSavings(monthlyPackage, yearlyPackage);

  // Actions handlers (memoized)
  const { handleClose, handlePurchase, handleRestore } = usePaywallActions({
    selectedPlan,
    monthlyPackage,
    yearlyPackage,
  });

  // Configure header
  usePaywallHeader({
    onClose: handleClose,
    onRestore: handleRestore,
    isLoading,
  });

  // Load offerings on mount
  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Title Section */}
        <View className="pb-2 pt-4">
          <ProBadge />
          <Text className="mb-4 text-[2.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white">
            {t('paywall.hero.title')}
          </Text>
          <Text className="max-w-[300px] text-base font-normal leading-relaxed text-gray-500 dark:text-gray-400">
            {t('paywall.hero.subtitle')}
          </Text>
        </View>

        {/* Features Section */}
        <View className="py-6">
          <View className="gap-4">
            {PRO_FEATURES.map((feature) => (
              <FeatureRow
                key={feature.titleKey}
                icon={feature.icon}
                title={t(feature.titleKey)}
                description={t(feature.descriptionKey)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Pricing Section - Fixed at bottom */}
      <View className="gap-4 px-6 pb-4">
        {/* Yearly Card */}
        <YearlyPricingCard
          title={t('paywall.plans.yearly.title')}
          price={formatPackagePrice(yearlyPackage)}
          period={t('paywall.plans.yearly.period')}
          originalPrice={yearlySavings.originalPrice}
          badge={t('paywall.plans.save', { percent: yearlySavings.savings })}
          hasTrial
          trialText={t('paywall.plans.trial')}
          isSelected={selectedPlan === 'yearly'}
          onPress={() => setSelectedPlan('yearly')}
        />

        {/* Monthly Card */}
        <MonthlyPricingCard
          title={t('paywall.plans.monthly.title')}
          price={formatPackagePrice(monthlyPackage)}
          period={t('paywall.plans.monthly.period')}
          subtitle={t('paywall.plans.monthly.subtitle')}
          isSelected={selectedPlan === 'monthly'}
          onPress={() => setSelectedPlan('monthly')}
        />

        {/* CTA Button */}
        <Pressable
          onPress={handlePurchase}
          disabled={isLoading}
          accessibilityRole="button"
          className="mt-2 h-14 w-full items-center justify-center rounded-xl bg-primary-500 px-4 shadow-lg shadow-primary-500/20 active:scale-[0.98]"
        >
          <Text className="text-base font-bold uppercase tracking-wide text-white">
            {isLoading ? t('paywall.cta.processing') : t('paywall.cta.trial')}
          </Text>
        </Pressable>

        {/* Footer */}
        <PaywallFooter />
      </View>
    </View>
  );
}
