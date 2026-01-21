import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Linking, Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

// ============================================================================
// Sub-Components
// ============================================================================

function ProBadge() {
  return (
    <View className="mb-4 flex-row items-center self-start rounded-full border border-primary-500/20 bg-gray-100 px-3 py-1.5 dark:bg-[#1a2233]">
      <View className="mr-2 h-2 w-2 rounded-full bg-primary-500" />
      <Text className="text-[10px] font-bold uppercase tracking-widest text-primary-500">
        WakeMind Pro
      </Text>
    </View>
  );
}

interface FeatureRowProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View className="flex-row items-start gap-4 rounded-lg p-3">
      <View className="mt-1 h-8 w-8 items-center justify-center rounded bg-primary-500/10">
        <MaterialSymbol name={icon} size={20} color={COLORS.brandPrimary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900 dark:text-white">{title}</Text>
        <Text className="mt-0.5 text-sm leading-snug text-gray-500 dark:text-gray-400">
          {description}
        </Text>
      </View>
    </View>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  originalPrice?: string;
  badge?: string;
  hasTrial?: boolean;
  trialText?: string;
  isSelected: boolean;
  onPress: () => void;
}

function YearlyPricingCard({
  title,
  price,
  period,
  originalPrice,
  badge,
  hasTrial,
  trialText,
  isSelected,
  onPress,
}: PricingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={
        isSelected
          ? 'rounded-2xl bg-gradient-to-b from-primary-500 via-primary-500/50 to-transparent p-[1px]'
          : ''
      }
    >
      <View className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1a2233]">
        {badge ? (
          <View className="absolute right-3 top-3 rounded bg-primary-500 px-2 py-1 shadow-lg shadow-primary-500/40">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
              {badge}
            </Text>
          </View>
        ) : null}

        <View className="mb-2 flex-row items-end justify-between">
          <View>
            <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary-500">
              {title}
            </Text>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">{price}</Text>
          </View>
          <View className="mb-1 items-end">
            {originalPrice ? (
              <Text className="text-sm text-gray-400 line-through dark:text-gray-500">
                {originalPrice}
              </Text>
            ) : null}
            <Text className="text-xs text-gray-500 dark:text-gray-400">{period}</Text>
          </View>
        </View>

        <View className="my-4 h-px bg-gray-200 dark:bg-gray-800" />

        {hasTrial ? (
          <View className="flex-row items-center gap-2">
            <MaterialSymbol name="check_circle" size={18} color={COLORS.brandPrimary} />
            <Text className="text-sm font-medium text-gray-900 dark:text-white">{trialText}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

interface MonthlyPricingCardProps {
  title: string;
  price: string;
  period: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
}

function MonthlyPricingCard({
  title,
  price,
  period,
  subtitle,
  isSelected,
  onPress,
}: MonthlyPricingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center justify-between rounded-xl border p-4 ${isSelected ? 'border-primary-500 bg-white dark:bg-[#1a2233]' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1a2233]'}`}
    >
      <View>
        <Text
          className={`text-sm font-medium ${isSelected ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}
        >
          {title}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{price}</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">{period}</Text>
      </View>
    </Pressable>
  );
}

export default function PaywallScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  const { offerings, purchase, restore, isLoading, loadOfferings, refreshStatus } =
    useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleRestore = useCallback(async () => {
    const success = await restore();
    if (success) {
      await refreshStatus();
      router.back();
    }
  }, [restore, refreshStatus, router]);

  // Configure header with useLayoutEffect
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'WakeMind Pro',
      headerLeft: () => (
        <Pressable accessibilityRole="button" onPress={handleClose} className="p-2">
          <MaterialSymbol name="close" size={24} className="text-gray-900 dark:text-white" />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          onPress={handleRestore}
          disabled={isLoading}
          className="p-2"
        >
          <Text className="text-sm font-semibold text-primary-500">{t('paywall.cta.restore')}</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleClose, handleRestore, isLoading, t]);

  // Load offerings on mount
  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  // Find yearly and monthly packages
  const yearlyPackage = offerings?.find(
    (pkg) => pkg.packageType === 'ANNUAL' || pkg.identifier.toLowerCase().includes('annual')
  );
  const monthlyPackage = offerings?.find(
    (pkg) => pkg.packageType === 'MONTHLY' || pkg.identifier.toLowerCase().includes('monthly')
  );

  const handlePurchase = async () => {
    const selectedPackage = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;
    if (!selectedPackage) return;

    const success = await purchase(selectedPackage);
    if (success) {
      await refreshStatus();
      router.back();
    }
  };

  const handleTermsPress = () => {
    Linking.openURL('https://wakemind.app/terms');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://wakemind.app/privacy');
  };

  // Format price from package
  const formatPrice = (pkg: PurchasesPackage | undefined) => {
    if (!pkg) return '$0.00';
    return pkg.product.priceString;
  };

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
            <FeatureRow
              icon="all_inclusive"
              title={t('paywall.features.unlimitedAlarms.title')}
              description={t('paywall.features.unlimitedAlarms.description')}
            />
            <FeatureRow
              icon="psychology"
              title={t('paywall.features.allDifficulties.title')}
              description={t('paywall.features.allDifficulties.description')}
            />
            <FeatureRow
              icon="timeline"
              title={t('paywall.features.advancedStats.title')}
              description={t('paywall.features.advancedStats.description')}
            />
            <FeatureRow
              icon="ac_unit"
              title={t('paywall.features.streakFreeze.title')}
              description={t('paywall.features.streakFreeze.description')}
            />
          </View>
        </View>
      </ScrollView>

      {/* Pricing Section - Fixed at bottom */}
      <View className="gap-4 px-6 pb-4">
        {/* Yearly Card */}
        <YearlyPricingCard
          title={t('paywall.plans.yearly.title')}
          price={formatPrice(yearlyPackage)}
          period={t('paywall.plans.yearly.period')}
          originalPrice="$35.88"
          badge={t('paywall.plans.save', { percent: '44%' })}
          hasTrial
          trialText={t('paywall.plans.trial')}
          isSelected={selectedPlan === 'yearly'}
          onPress={() => setSelectedPlan('yearly')}
        />

        {/* Monthly Card */}
        <MonthlyPricingCard
          title={t('paywall.plans.monthly.title')}
          price={formatPrice(monthlyPackage)}
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
        <View className="mt-2 items-center gap-3">
          <Text className="max-w-xs text-center text-[10px] leading-relaxed text-gray-400 dark:text-gray-600">
            {t('paywall.footer.disclaimer')}
          </Text>
          <View className="flex-row items-center gap-4">
            <Pressable onPress={handleTermsPress} accessibilityRole="link">
              <Text className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {t('paywall.footer.terms')}
              </Text>
            </Pressable>
            <Text className="text-[10px] text-gray-300 dark:text-gray-700">•</Text>
            <Pressable onPress={handlePrivacyPress} accessibilityRole="link">
              <Text className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {t('paywall.footer.privacy')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
