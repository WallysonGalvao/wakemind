import accessibilityES from './accessibility';
import { appES } from './app';
import { backES } from './back';
import { countriesES } from './countries';
import { expoES } from './expo';
import { quickActionsES } from './quick-actions';
import { sportsES } from './sports';

export default {
  ...appES,
  ...backES,
  ...countriesES,
  ...sportsES,
  ...expoES,
  ...quickActionsES,
  ...accessibilityES,
};
