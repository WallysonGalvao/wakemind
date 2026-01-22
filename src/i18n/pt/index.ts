import accessibilityPT from './accessibility';
import { alarmSchedulerPT } from './alarm-scheduler';
import { appPT } from './app';
import { backPT } from './back';
import { countriesPT } from './countries';
import { dashboardPT } from './dashboard';
import { expoPT } from './expo';
import { onboardingPT } from './onboarding';
import { privacyPolicyPT } from './privacy-policy';
import { quickActionsPT } from './quick-actions';
import { settingsPT } from './settings';
import { sportsPT } from './sports';
import subscriptionPT from './subscription';
import { supportPT } from './support';
import { tabsPT } from './tabs';
import { widgetsPT } from './widgets';

export default {
  ...appPT,
  ...backPT,
  ...countriesPT,
  ...dashboardPT,
  ...sportsPT,
  ...expoPT,
  ...onboardingPT,
  ...quickActionsPT,
  ...settingsPT,
  ...subscriptionPT,
  ...tabsPT,
  ...accessibilityPT,
  ...privacyPolicyPT,
  ...supportPT,
  ...alarmSchedulerPT,
  ...widgetsPT,
};
