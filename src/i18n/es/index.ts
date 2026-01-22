import accessibilityES from './accessibility';
import { alarmSchedulerES } from './alarm-scheduler';
import { appES } from './app';
import { backES } from './back';
import { countriesES } from './countries';
import { dashboardES } from './dashboard';
import { expoES } from './expo';
import { onboardingES } from './onboarding';
import { privacyPolicyES } from './privacy-policy';
import { quickActionsES } from './quick-actions';
import { settingsES } from './settings';
import { sportsES } from './sports';
import subscriptionES from './subscription';
import { supportES } from './support';
import { tabsES } from './tabs';
import { widgetsES } from './widgets';

export default {
  ...appES,
  ...backES,
  ...countriesES,
  ...dashboardES,
  ...sportsES,
  ...expoES,
  ...onboardingES,
  ...quickActionsES,
  ...settingsES,
  ...subscriptionES,
  ...tabsES,
  ...accessibilityES,
  ...privacyPolicyES,
  ...supportES,
  ...alarmSchedulerES,
  ...widgetsES,
};
