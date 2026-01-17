import accessibilityES from './accessibility';
import { appES } from './app';
import { backES } from './back';
import { countriesES } from './countries';
import { expoES } from './expo';
import { onboardingES } from './onboarding';
import { privacyPolicyES } from './privacy-policy';
import { quickActionsES } from './quick-actions';
import { settingsES } from './settings';
import { sportsES } from './sports';
import { supportES } from './support';
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
  ...privacyPolicyES,
  ...supportES,
};
