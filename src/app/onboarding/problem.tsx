import React from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { OnboardingStep } from '@/features/onboarding/components/onboarding-step';
import { useSettingsStore } from '@/stores/use-settings-store';

export default function ProblemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);

  const handleContinue = () => {
    router.push('/onboarding/solution');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <OnboardingStep
        currentStep="problem"
        icon="mist"
        title={
          <View>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              {t('onboarding.problem.title1')}
            </Text>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              {t('onboarding.problem.title2')}
            </Text>
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-400 dark:text-[#5e6d8a]">
              {t('onboarding.problem.title3')}
            </Text>
          </View>
        }
        bodyPrimary={t('onboarding.problem.bodyPrimary')}
        bodySecondary={t('onboarding.problem.bodySecondary')}
        onContinue={handleContinue}
        onSkip={handleSkip}
      />
    </View>
  );
}
