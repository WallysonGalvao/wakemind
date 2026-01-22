import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

/**
 * Paywall footer with legal links
 * Extracted for better reusability and testability
 */
export function PaywallFooter() {
  const { t } = useTranslation();
  const router = useRouter();

  const handlePrivacyPress = () => {
    router.push('/settings/privacy-policy');
  };

  const handleSupportPress = () => {
    router.push('/settings/support');
  };

  return (
    <View className="mt-2 items-center gap-3">
      <Text className="max-w-xs text-center text-[10px] leading-relaxed text-gray-400 dark:text-gray-600">
        {t('paywall.footer.disclaimer')}
      </Text>
      <View className="flex-row items-center gap-4">
        <Pressable onPress={handlePrivacyPress} accessibilityRole="link">
          <Text className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {t('paywall.footer.privacy')}
          </Text>
        </Pressable>
        <Text className="text-[10px] text-gray-300 dark:text-gray-700">•</Text>
        <Pressable onPress={handleSupportPress} accessibilityRole="link">
          <Text className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {t('settings.support')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
