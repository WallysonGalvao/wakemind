import accessibilityEN from './accessibility';
import { alarmSchedulerEN } from './alarm-scheduler';
import { appEN } from './app';
import { backEN } from './back';
import { countriesEN } from './countries';
import { dashboardEN } from './dashboard';
import { expoEN } from './expo';
import { onboardingEN } from './onboarding';
import { privacyPolicyEN } from './privacy-policy';
import { quickActionsEN } from './quick-actions';
import { settingsEN } from './settings';
import { sportsEN } from './sports';
import { supportEN } from './support';
import { tabsEN } from './tabs';

export default {
  ...appEN,
  ...backEN,
  ...countriesEN,
  ...dashboardEN,
  ...sportsEN,
  ...expoEN,
  ...onboardingEN,
  ...quickActionsEN,
  ...settingsEN,
  ...tabsEN,
  ...accessibilityEN,
  ...privacyPolicyEN,
  ...supportEN,
  ...alarmSchedulerEN,
};
