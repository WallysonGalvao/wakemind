import { useTranslation } from 'react-i18next';

import { Linking, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

const TERMS_URL = 'https://wakemind.app/terms';
const PRIVACY_URL = 'https://wakemind.app/privacy';

/**
 * Paywall footer with legal links
 * Extracted for better reusability and testability
 */
export function PaywallFooter() {
  const { t } = useTranslation();

  const handleTermsPress = () => {
    Linking.openURL(TERMS_URL);
  };

  const handlePrivacyPress = () => {
    Linking.openURL(PRIVACY_URL);
  };

  return (
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
  );
}
