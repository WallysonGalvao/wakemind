import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/pt-br';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const configureDayjsLocale = (locale: string) => {
  const localeMap: Record<string, string> = {
    en: 'en',
    pt: 'pt-br',
    'pt-BR': 'pt-br',
    es: 'es',
  };

  const dayjsLocale = localeMap[locale] || 'en';
  dayjs.locale(dayjsLocale);
};

export { dayjs };
