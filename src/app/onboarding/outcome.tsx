import React from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { OnboardingStep } from '@/features/onboarding/components/onboarding-step';
import { useSettingsStore } from '@/stores/use-settings-store';

export default function OutcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);

  const handleContinue = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <OnboardingStep
        currentStep="outcome"
        icon="rocket_launch"
        title={
          <View>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              {t('onboarding.outcome.title1')}
            </Text>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-brand-primary">
              {t('onboarding.outcome.title2')}
            </Text>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              {t('onboarding.outcome.title3')}
            </Text>
          </View>
        }
        bodyPrimary={t('onboarding.outcome.bodyPrimary')}
        bodySecondary={t('onboarding.outcome.bodySecondary')}
        onContinue={handleContinue}
        isLastStep
      />
    </View>
  );
}
