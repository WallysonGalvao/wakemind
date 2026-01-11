import React from 'react';

import { useTranslation } from 'react-i18next';

import { Pressable, StyleSheet, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';

// ============================================================================
// Types
// ============================================================================

export type OnboardingStepId = 'problem' | 'solution' | 'outcome';

interface OnboardingStepProps {
  currentStep: OnboardingStepId;
  icon: string;
  title: React.ReactNode;
  bodyPrimary: string;
  bodySecondary?: string;
  onContinue: () => void;
  onSkip?: () => void;
  isLastStep?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const STEPS: OnboardingStepId[] = ['problem', 'solution', 'outcome'];

const STEP_LABELS: Record<OnboardingStepId, string> = {
  problem: 'onboarding.steps.problem',
  solution: 'onboarding.steps.solution',
  outcome: 'onboarding.steps.outcome',
};

// ============================================================================
// Sub-Components
// ============================================================================

function ProgressIndicator({ currentStep }: { currentStep: OnboardingStepId }) {
  const { t } = useTranslation();
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <View className="flex-row items-center justify-center rounded-xl bg-gray-200 p-1 dark:bg-[#1a2230]">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        const isDisabled = index > currentIndex;

        return (
          <View
            key={step}
            className={`flex-1 items-center justify-center rounded-lg py-2 ${
              isActive ? 'bg-brand-primary shadow-md' : ''
            } ${isDisabled ? 'opacity-60' : ''}`}
          >
            <Text
              className={`text-xs font-semibold uppercase tracking-wide ${
                isActive
                  ? 'text-white'
                  : isPast
                    ? 'text-brand-primary'
                    : 'text-gray-500 dark:text-[#92a4c9]'
              }`}
            >
              {t(STEP_LABELS[step])}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const backgroundStyles = StyleSheet.create({
  blueGlow: {
    position: 'absolute',
    top: '-10%',
    left: '-20%',
    width: '140%',
    height: '60%',
    borderRadius: 9999,
    backgroundColor: COLORS.brandPrimary + '1A', // 10% opacity
  },
  purpleShadow: {
    position: 'absolute',
    top: '30%',
    right: '-30%',
    width: '100%',
    height: '50%',
    borderRadius: 9999,
    backgroundColor: COLORS.indigo[900] + '33', // 20% opacity
  },
  button: {
    shadowColor: COLORS.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

function BackgroundEffects() {
  return (
    <>
      {/* Soft blue abstract glow representing morning light */}
      <View style={backgroundStyles.blueGlow} pointerEvents="none" />
      {/* Deep purple abstract shadow representing brain fog */}
      <View style={backgroundStyles.purpleShadow} pointerEvents="none" />
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OnboardingStep({
  currentStep,
  icon,
  title,
  bodyPrimary,
  bodySecondary,
  onContinue,
  onSkip,
  isLastStep = false,
}: OnboardingStepProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <BackgroundEffects />

      {/* Top Header */}
      <View className="relative z-10 flex-row items-center justify-between px-6 pb-2 pt-6">
        {/* Branding */}
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="bolt" size={24} color={COLORS.brandPrimary} />
          <Text className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            WakeMind
          </Text>
        </View>

        {/* Skip Action */}
        {onSkip ? (
          <Pressable
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.skip')}
            accessibilityHint="Skip onboarding and go to home screen"
            className="h-10 items-center justify-center rounded-full px-4 active:bg-gray-200 dark:active:bg-[#232f48]"
          >
            <Text className="text-sm font-bold text-gray-500 dark:text-[#92a4c9]">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        ) : (
          <View className="h-10 w-16" />
        )}
      </View>

      {/* Segmented Progress Indicator */}
      <View className="relative z-10 px-6 py-4">
        <ProgressIndicator currentStep={currentStep} />
      </View>

      {/* Main Content Section */}
      <View className="relative z-10 flex-1 justify-center px-6 pb-10 pt-2">
        {/* Abstract Icon */}
        <View className="mb-8 w-fit rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 p-4 shadow-xl ring-1 ring-inset ring-black/5 dark:from-gray-800 dark:to-gray-900 dark:ring-white/10">
          <MaterialSymbol name={icon} size={36} className="text-gray-500 dark:text-gray-400" />
        </View>

        {/* Headline */}
        <View className="mb-6">
          {typeof title === 'string' ? (
            <Text className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              {title}
            </Text>
          ) : (
            title
          )}
        </View>

        {/* Body Text */}
        <View className="gap-4">
          <Text className="max-w-md text-lg font-medium leading-relaxed text-gray-600 dark:text-[#b0b8c8]">
            {bodyPrimary}
          </Text>
          {bodySecondary ? (
            <Text className="max-w-md text-base leading-normal text-gray-500 dark:text-[#808a9d]">
              {bodySecondary}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Bottom Action Area */}
      <View className="relative z-10 mt-auto p-6 pb-10 pt-0">
        <Pressable
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel={isLastStep ? t('onboarding.getStarted') : t('onboarding.continue')}
          accessibilityHint={
            isLastStep
              ? 'Complete onboarding and start using the app'
              : 'Go to next onboarding step'
          }
          className="h-14 flex-row items-center justify-center gap-3 rounded-xl bg-brand-primary px-5 shadow-lg active:scale-[0.98]"
          style={backgroundStyles.button}
        >
          <Text className="text-lg font-bold tracking-wide text-white">
            {isLastStep ? t('onboarding.getStarted') : t('onboarding.continue')}
          </Text>
          <MaterialSymbol
            name={isLastStep ? 'check' : 'arrow_forward'}
            size={24}
            color={COLORS.white}
          />
        </Pressable>
      </View>
    </View>
  );
}
