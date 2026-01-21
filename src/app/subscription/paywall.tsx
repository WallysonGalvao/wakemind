import { useEffect, useState } from 'react';

import { router, Stack } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Linking, Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

// ============================================================================
// Sub-Components
// ============================================================================

function ProBadge() {
  return (
    <View className="mb-4 flex-row items-center self-start rounded-full border border-cyan-500/20 bg-[#0e1a2b] px-3 py-1.5">
      <View className="mr-2 h-2 w-2 rounded-full bg-cyan-400" />
      <Text className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
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
      <View className="mt-1 h-8 w-8 items-center justify-center rounded bg-cyan-400/10">
        <MaterialSymbol name={icon} size={20} color="#22d3ee" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-white">{title}</Text>
        <Text className="mt-0.5 text-sm leading-snug text-gray-400">{description}</Text>
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
  isSelected,
  onPress,
}: PricingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={isSelected ? 'bg-gradient-to-b from-cyan-400 via-cyan-400/50 to-transparent' : ''}
    >
      <View className="relative w-full overflow-hidden rounded-2xl bg-[#0e1a2b] p-5">
        {badge ? (
          <View className="absolute right-3 top-3 rounded bg-cyan-400 px-2 py-1 shadow-lg shadow-cyan-400/40">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-[#0a192f]">
              {badge}
            </Text>
          </View>
        ) : null}

        <View className="mb-2 flex-row items-end justify-between">
          <View>
            <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {title}
            </Text>
            <Text className="text-3xl font-bold text-white">{price}</Text>
          </View>
          <View className="mb-1 items-end">
            {originalPrice ? (
              <Text className="text-sm text-gray-500 line-through">{originalPrice}</Text>
            ) : null}
            <Text className="text-xs text-gray-400">{period}</Text>
          </View>
        </View>

        <View className="my-4 h-px bg-gray-800" />

        {hasTrial ? (
          <View className="flex-row items-center gap-2">
            <MaterialSymbol name="check_circle" size={18} color="#22d3ee" />
            <Text className="text-sm font-medium text-white">7-Day Free Trial included</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function MonthlyPricingCard({
  title,
  price,
  period,
  isSelected,
  onPress,
}: Omit<PricingCardProps, 'originalPrice' | 'badge' | 'hasTrial'>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center justify-between rounded-xl border p-4 ${isSelected ? 'border-cyan-400 bg-[#0e1a2b]' : 'border-gray-800 bg-[#0e1a2b]'}`}
    >
      <View>
        <Text className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
          {title}
        </Text>
        <Text className="text-xs text-gray-500">Flexible commitment</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-lg font-bold text-white">{price}</Text>
        <Text className="text-xs text-gray-500">{period}</Text>
      </View>
    </Pressable>
  );
}

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { offerings, purchase, restore, isLoading, loadOfferings, refreshStatus } =
    useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

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

  const handleRestore = async () => {
    const success = await restore();
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
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <View
        className="flex-1 bg-[#050a12]"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Header */}
        <View className="z-10 flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={() => router.back()} accessibilityRole="button" className="w-10">
            <MaterialSymbol name="close" size={24} color="#9ca3af" />
          </Pressable>
          <View className="h-1 w-12 rounded-full bg-gray-800" />
          <Pressable onPress={handleRestore} accessibilityRole="button" disabled={isLoading}>
            <Text className="text-sm font-semibold tracking-wide text-gray-400">Restore</Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Title Section */}
          <View className="pb-2 pt-4">
            <ProBadge />
            <Text className="mb-4 text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
              Peak{'\n'}Performance
            </Text>
            <Text className="max-w-[300px] text-base font-normal leading-relaxed text-gray-400">
              Unlock the complete toolkit for absolute reliability and cognitive optimization.
            </Text>
          </View>

          {/* Features Section */}
          <View className="py-6">
            <View className="gap-4">
              <FeatureRow
                icon="shield"
                title="Absolute Reliability"
                description="Advanced alarm protocols that guarantee you wake up, no matter what."
              />
              <FeatureRow
                icon="monitoring"
                title="Performance Insights"
                description="Deep analytics on wake-up times, sleep inertia, and cognitive readiness."
              />
            </View>
          </View>
        </ScrollView>

        {/* Pricing Section - Fixed at bottom */}
        <View className="gap-4 px-6 pb-4">
          {/* Yearly Card */}
          <YearlyPricingCard
            title="Yearly Access"
            price={formatPrice(yearlyPackage)}
            period="/ year"
            originalPrice="$119.99"
            badge="Best Value"
            hasTrial
            isSelected={selectedPlan === 'yearly'}
            onPress={() => setSelectedPlan('yearly')}
          />

          {/* Monthly Card */}
          <MonthlyPricingCard
            title="Monthly Plan"
            price={formatPrice(monthlyPackage)}
            period="/ mo"
            isSelected={selectedPlan === 'monthly'}
            onPress={() => setSelectedPlan('monthly')}
          />

          {/* CTA Button */}
          <Pressable
            onPress={handlePurchase}
            disabled={isLoading}
            accessibilityRole="button"
            className="mt-2 h-14 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 shadow-lg shadow-cyan-400/20 active:scale-[0.98]"
          >
            <Text className="text-base font-bold uppercase tracking-wide text-[#0a192f]">
              {isLoading ? 'Processing...' : 'Start 7-Day Free Trial'}
            </Text>
          </Pressable>

          {/* Footer */}
          <View className="mt-2 items-center gap-3">
            <Text className="max-w-xs text-center text-[10px] leading-relaxed text-gray-600">
              Subscription automatically renews. Cancel anytime via Account Settings.
            </Text>
            <View className="flex-row items-center gap-4">
              <Pressable onPress={handleTermsPress} accessibilityRole="link">
                <Text className="text-[10px] font-medium text-gray-400">Terms of Service</Text>
              </Pressable>
              <Text className="text-[10px] text-gray-700">•</Text>
              <Pressable onPress={handlePrivacyPress} accessibilityRole="link">
                <Text className="text-[10px] font-medium text-gray-400">Privacy Policy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
