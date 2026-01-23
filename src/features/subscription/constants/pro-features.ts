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
    titleKey: 'paywall.features.hardDifficulty.title',
    descriptionKey: 'paywall.features.hardDifficulty.description',
  },
  {
    icon: 'timeline',
    titleKey: 'paywall.features.advancedStats.title',
    descriptionKey: 'paywall.features.advancedStats.description',
  },
  {
    icon: 'music_note',
    titleKey: 'paywall.features.premiumSounds.title',
    descriptionKey: 'paywall.features.premiumSounds.description',
  },
];
