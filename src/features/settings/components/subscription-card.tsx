import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function SubscriptionCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const shadowStyle = useShadowStyle('lg', 'rgba(19, 91, 236, 0.25)');

  const { isPro, customerInfo } = useSubscriptionStore();

  const handlePress = async () => {
    if (isPro) {
      // User is Pro - navigate to account screen
      router.push('/subscription/account');
    } else {
      // User is Free - show paywall
      router.push('/subscription/paywall');
    }
  };

  // Get subscription expiration/renewal date
  const getSubscriptionDate = () => {
    if (!customerInfo?.entitlements.active['pro']) return null;

    const entitlement = customerInfo.entitlements.active['pro'];
    const expirationDate = entitlement.expirationDate;

    if (!expirationDate) return null;

    const date = new Date(expirationDate);
    const formattedDate = date.toLocaleDateString();

    return {
      date: formattedDate,
      willRenew: entitlement.willRenew,
    };
  };

  const subscriptionDate = getSubscriptionDate();

  if (isPro) {
    // Pro User Card
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('settings.subscription.manage')}
        accessibilityHint={t('settings.subscription.manageDescription')}
        style={shadowStyle}
        className="relative mb-8 justify-center overflow-hidden rounded-xl bg-brand-primary"
      >
        <View className="p-5">
          {/* Header */}
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MaterialSymbol name="verified" size={18} color="#ffffff" />
              </View>
              <Text className="text-sm font-bold uppercase tracking-wider text-white">
                {t('settings.subscription.pro')}
              </Text>
            </View>
            <MaterialSymbol name="settings" size={20} color="rgba(255, 255, 255, 0.9)" />
          </View>

          {/* Content */}
          <Text className="mb-1 text-lg font-bold text-white">
            {t('subscription.card.active.title')}
          </Text>
          <Text className="text-xs text-blue-100">{t('subscription.card.active.subtitle')}</Text>

          {/* Subscription Info */}
          {subscriptionDate ? (
            <View className="mt-3 flex-row items-center gap-1.5">
              <MaterialSymbol name="event" size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text className="text-xs text-white/80">
                {subscriptionDate.willRenew
                  ? t('settings.subscription.renews', { date: subscriptionDate.date })
                  : t('settings.subscription.expires', { date: subscriptionDate.date })}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  // Free User Card
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('subscription.card.title')}
      accessibilityHint={t('subscription.card.subtitle')}
      style={shadowStyle}
      className="relative mb-8 h-24 justify-center overflow-hidden rounded-xl bg-brand-primary"
    >
      <View className="flex-row items-center gap-4 p-5">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
          <MaterialSymbol name="crown" size={24} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold leading-tight text-white">
            {t('subscription.card.title')}
          </Text>
          <Text className="mt-1 text-xs font-medium text-blue-100">
            {t('subscription.card.subtitle')}
          </Text>
        </View>
        <MaterialSymbol name="chevron_right" size={24} color="rgba(255, 255, 255, 0.9)" />
      </View>
    </Pressable>
  );
}
