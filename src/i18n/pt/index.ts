import accessibilityPT from './accessibility';
import { appPT } from './app';
import { backPT } from './back';
import { countriesPT } from './countries';
import { expoPT } from './expo';
import { onboardingPT } from './onboarding';
import { quickActionsPT } from './quick-actions';
import { settingsPT } from './settings';
import { sportsPT } from './sports';
import { tabsPT } from './tabs';

export default {
  ...appPT,
  ...backPT,
  ...countriesPT,
  ...sportsPT,
  ...expoPT,
  ...onboardingPT,
  ...quickActionsPT,
  ...settingsPT,
  ...tabsPT,
  ...accessibilityPT,
};
