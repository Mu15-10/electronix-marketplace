import { getRequestConfig } from 'next-intl/server';
import { locales } from '@/lib/i18n-config';

export default getRequestConfig(async ({ locale }) => {
  const baseLocale = locale.split('-')[0];
  const matched = locales.includes(baseLocale as any) ? baseLocale : 'en';

  try {
    const messages = (await import(`@/messages/${matched}.json`)).default;
    return {
      messages,
      locale: matched,
    };
  } catch {
    const messages = (await import(`@/messages/en.json`)).default;
    return {
      messages,
      locale: 'en',
    };
  }
});
