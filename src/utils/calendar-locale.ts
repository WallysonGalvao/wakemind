type SupportedLocale = 'en' | 'pt' | 'pt-BR' | 'es';

const calendarLocales: Record<SupportedLocale, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  'pt-BR': 'pt-BR',
  es: 'es-ES',
};

export const configureCalendarLocale = (locale: SupportedLocale) => {
  return calendarLocales[locale] || 'en-US';
};
