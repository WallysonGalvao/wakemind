import type { OnboardingItemData } from '../components/onboarding-item';

export const ONBOARDING_ITEMS: OnboardingItemData[] = [
  {
    id: 'problem',
    icon: 'mist',
    titleKey: 'onboarding.problem.title',
    titleLines: [
      'onboarding.problem.title1',
      'onboarding.problem.title2',
      'onboarding.problem.title3',
    ],
    fadedLineIndex: 2,
    bodyPrimaryKey: 'onboarding.problem.bodyPrimary',
    bodySecondaryKey: 'onboarding.problem.bodySecondary',
  },
  {
    id: 'solution',
    icon: 'psychology',
    titleKey: 'onboarding.solution.title',
    titleLines: [
      'onboarding.solution.title1',
      'onboarding.solution.title2',
      'onboarding.solution.title3',
    ],
    highlightedLineIndex: 1,
    bodyPrimaryKey: 'onboarding.solution.bodyPrimary',
    bodySecondaryKey: 'onboarding.solution.bodySecondary',
  },
  {
    id: 'outcome',
    icon: 'rocket_launch',
    titleKey: 'onboarding.outcome.title',
    titleLines: [
      'onboarding.outcome.title1',
      'onboarding.outcome.title2',
      'onboarding.outcome.title3',
    ],
    highlightedLineIndex: 1,
    bodyPrimaryKey: 'onboarding.outcome.bodyPrimary',
    bodySecondaryKey: 'onboarding.outcome.bodySecondary',
  },
];
