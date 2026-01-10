import accessibilityES from './accessibility';
import { appES } from './app';
import { backES } from './back';
import { countriesES } from './countries';
import { expoES } from './expo';
import { onboardingES } from './onboarding';
import { quickActionsES } from './quick-actions';
import { settingsES } from './settings';
import { sportsES } from './sports';
import { tabsES } from './tabs';

export default {
  ...appES,
  ...backES,
  ...countriesES,
  ...sportsES,
  ...expoES,
  ...onboardingES,
  ...quickActionsES,
  ...settingsES,
  ...tabsES,
  ...accessibilityES,
};
