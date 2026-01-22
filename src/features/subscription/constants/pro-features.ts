/**
 * Pro Features Constants
 * Single source of truth for Pro subscription features
 * Used in Paywall screen and Account screen
 */

export interface ProFeature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

/**
 * List of features included in Pro subscription
 * Translation keys reference paywall.features.* namespace
 */
export const PRO_FEATURES: ProFeature[] = [
  {
    icon: 'all_inclusive',
    titleKey: 'paywall.features.unlimitedAlarms.title',
    descriptionKey: 'paywall.features.unlimitedAlarms.description',
  },
  {
    icon: 'psychology',
    titleKey: 'paywall.features.allDifficulties.title',
    descriptionKey: 'paywall.features.allDifficulties.description',
  },
  {
    icon: 'timeline',
    titleKey: 'paywall.features.advancedStats.title',
    descriptionKey: 'paywall.features.advancedStats.description',
  },
  {
    icon: 'extension',
    titleKey: 'paywall.features.premiumChallenges.title',
    descriptionKey: 'paywall.features.premiumChallenges.description',
  },
];
