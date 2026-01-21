import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';

export function SubscriptionCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const shadowStyle = useShadowStyle('lg', 'rgba(19, 91, 236, 0.25)');

  return (
    <Pressable
      onPress={() => router.push('/subscription/paywall')}
      accessibilityRole="button"
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
