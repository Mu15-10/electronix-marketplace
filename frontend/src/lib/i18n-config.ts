export const locales = ['en', 'ar', 'tr', 'es', 'it', 'fr', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  tr: 'Türkçe',
  es: 'Español',
  it: 'Italiano',
  fr: 'Français',
  pt: 'Português',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  tr: '🇹🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  fr: '🇫🇷',
  pt: '🇧🇷',
};

export const rtlLocales: Locale[] = ['ar'];

export function isRtl(lang: string): boolean {
  return rtlLocales.includes(lang as Locale);
}

export function dir(lang: string): 'rtl' | 'ltr' {
  return isRtl(lang) ? 'rtl' : 'ltr';
}

export function getLocaleName(lang: string): string {
  return localeNames[lang as Locale] || lang;
}
