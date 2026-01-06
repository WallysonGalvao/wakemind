import accessibilityPT from './accessibility'
import { appPT } from './app'
import { backPT } from './back'
import { countriesPT } from './countries'
import { expoPT } from './expo'
import { quickActionsPT } from './quick-actions'
import { sportsPT } from './sports'

export default {
  ...appPT,
  ...backPT,
  ...countriesPT,
  ...sportsPT,
  ...expoPT,
  ...quickActionsPT,
  ...accessibilityPT,
}
