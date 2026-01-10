import React from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { OnboardingStep } from '@/features/onboarding/components/onboarding-step';
import { useSettingsStore } from '@/stores/use-settings-store';

export default function SolutionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);

  const handleContinue = () => {
    router.push('/onboarding/outcome');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <OnboardingStep
        currentStep="solution"
        icon="psychology"
        title={
          <View>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              {t('onboarding.solution.title1')}
            </Text>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-brand-primary">
              {t('onboarding.solution.title2')}
            </Text>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              {t('onboarding.solution.title3')}
            </Text>
          </View>
        }
        bodyPrimary={t('onboarding.solution.bodyPrimary')}
        bodySecondary={t('onboarding.solution.bodySecondary')}
        onContinue={handleContinue}
        onSkip={handleSkip}
      />
    </View>
  );
}
