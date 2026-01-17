import * as Localization from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en'
import es from './es'
import pt from './pt'

import { configureDayjsLocale } from '@/configs/dayjs'
import { useSettingsStore } from '@/stores/use-settings-store'
import { configureCalendarLocale } from '@/utils/calendar-locale'

const supportedLanguages = ['en', 'pt-BR', 'es']

const getBestLanguageTag = (): string => {
  const locale = Localization.getLocales()[0]?.languageTag.toLowerCase()
  const matched = supportedLanguages.find(lang =>
    locale.startsWith(lang.toLowerCase()),
  )
  return matched || 'en'
}

const getInitialLanguage = (): string => {
  const storedLanguage = useSettingsStore.getState().language

  if (storedLanguage) {
    return storedLanguage
  }

  const systemLanguage = getBestLanguageTag()
  return systemLanguage
}

const initialLanguage = getInitialLanguage()

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: initialLanguage,
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    'pt-BR': { translation: pt },
  },
  interpolation: {
    escapeValue: false,
  },
})

// Configure initial locale for dayjs
configureDayjsLocale(initialLanguage)

useSettingsStore.subscribe(state => {
  const newLanguage = state.language
  if (newLanguage && newLanguage !== i18n.language) {
    i18n.changeLanguage(newLanguage)
    configureCalendarLocale(newLanguage as 'en' | 'pt' | 'pt-BR' | 'es')
    configureDayjsLocale(newLanguage)
  }
})

export default i18n
