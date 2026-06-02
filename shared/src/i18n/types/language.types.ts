export enum SupportedLanguage {
  ARABIC = 'ar',
  ENGLISH = 'en',
  TURKISH = 'tr',
  SPANISH = 'es',
  ITALIAN = 'it',
  FRENCH = 'fr',
  PORTUGUESE = 'pt',
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  SupportedLanguage.ARABIC,
  SupportedLanguage.ENGLISH,
  SupportedLanguage.TURKISH,
  SupportedLanguage.SPANISH,
  SupportedLanguage.ITALIAN,
  SupportedLanguage.FRENCH,
  SupportedLanguage.PORTUGUESE,
];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  [SupportedLanguage.ARABIC]: 'العربية',
  [SupportedLanguage.ENGLISH]: 'English',
  [SupportedLanguage.TURKISH]: 'Türkçe',
  [SupportedLanguage.SPANISH]: 'Español',
  [SupportedLanguage.ITALIAN]: 'Italiano',
  [SupportedLanguage.FRENCH]: 'Français',
  [SupportedLanguage.PORTUGUESE]: 'Português',
};

export const LANGUAGE_DIRECTIONS: Record<SupportedLanguage, 'rtl' | 'ltr'> = {
  [SupportedLanguage.ARABIC]: 'rtl',
  [SupportedLanguage.ENGLISH]: 'ltr',
  [SupportedLanguage.TURKISH]: 'ltr',
  [SupportedLanguage.SPANISH]: 'ltr',
  [SupportedLanguage.ITALIAN]: 'ltr',
  [SupportedLanguage.FRENCH]: 'ltr',
  [SupportedLanguage.PORTUGUESE]: 'ltr',
};

export const RTL_LANGUAGES: SupportedLanguage[] = [SupportedLanguage.ARABIC];

export const LOCALE_CONFIG: Record<SupportedLanguage, {
  locale: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
  timezone: string;
  firstDayOfWeek: 0 | 1 | 6;
}> = {
  [SupportedLanguage.ARABIC]: {
    locale: 'ar-SA',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'SAR' },
    timezone: 'Asia/Riyadh',
    firstDayOfWeek: 6,
  },
  [SupportedLanguage.ENGLISH]: {
    locale: 'en-US',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'hh:mm a',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'USD' },
    timezone: 'America/New_York',
    firstDayOfWeek: 0,
  },
  [SupportedLanguage.TURKISH]: {
    locale: 'tr-TR',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'TRY' },
    timezone: 'Europe/Istanbul',
    firstDayOfWeek: 1,
  },
  [SupportedLanguage.SPANISH]: {
    locale: 'es-ES',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'EUR' },
    timezone: 'Europe/Madrid',
    firstDayOfWeek: 1,
  },
  [SupportedLanguage.ITALIAN]: {
    locale: 'it-IT',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'EUR' },
    timezone: 'Europe/Rome',
    firstDayOfWeek: 1,
  },
  [SupportedLanguage.FRENCH]: {
    locale: 'fr-FR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'EUR' },
    timezone: 'Europe/Paris',
    firstDayOfWeek: 1,
  },
  [SupportedLanguage.PORTUGUESE]: {
    locale: 'pt-BR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'BRL' },
    timezone: 'America/Sao_Paulo',
    firstDayOfWeek: 0,
  },
};
