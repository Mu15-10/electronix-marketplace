import { SupportedLanguage, LANGUAGE_DIRECTIONS, RTL_LANGUAGES, LOCALE_CONFIG } from '../types/language.types';
import { TranslationSchema } from '../types/translation-namespace.types';
import { I18nLoader } from './i18n-loader';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export class I18nService {
  private loader: I18nLoader;
  private translations: Map<SupportedLanguage, DeepPartial<TranslationSchema>> = new Map();
  private currentLanguage: SupportedLanguage = SupportedLanguage.ENGLISH;

  constructor() {
    this.loader = I18nLoader.getInstance();
  }

  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  getDirection(): 'rtl' | 'ltr' {
    return LANGUAGE_DIRECTIONS[this.currentLanguage] || 'ltr';
  }

  isRtl(): boolean {
    return RTL_LANGUAGES.includes(this.currentLanguage);
  }

  getLocaleConfig(): typeof LOCALE_CONFIG[SupportedLanguage] {
    return LOCALE_CONFIG[this.currentLanguage] || LOCALE_CONFIG[SupportedLanguage.ENGLISH];
  }

  loadTranslations(lang: SupportedLanguage): DeepPartial<TranslationSchema> {
    if (!this.translations.has(lang)) {
      const loaded = this.loader.loadLanguageSync(lang);
      this.translations.set(lang, loaded);
    }
    return this.translations.get(lang)!;
  }

  preloadAll(): void {
    for (const lang of Object.values(SupportedLanguage)) {
      this.loadTranslations(lang);
    }
  }

  translate(key: string, lang?: SupportedLanguage): string {
    const targetLang = lang || this.currentLanguage;
    const translations = this.loadTranslations(targetLang);

    const parts = key.split('.');
    let result: any = translations;

    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  }

  t(key: string, lang?: SupportedLanguage): string {
    return this.translate(key, lang);
  }

  translateWithParams(key: string, params: Record<string, string | number>, lang?: SupportedLanguage): string {
    let text = this.translate(key, lang);
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }
    return text;
  }

  formatCurrency(amount: number, currency?: string, lang?: SupportedLanguage): string {
    const targetLang = lang || this.currentLanguage;
    const config = LOCALE_CONFIG[targetLang] || LOCALE_CONFIG[SupportedLanguage.ENGLISH];
    const curr = currency || (config.currencyFormat as any).currency || 'USD';

    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: curr,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${curr}`;
    }
  }

  formatNumber(amount: number, lang?: SupportedLanguage): string {
    const targetLang = lang || this.currentLanguage;
    const config = LOCALE_CONFIG[targetLang] || LOCALE_CONFIG[SupportedLanguage.ENGLISH];

    try {
      return new Intl.NumberFormat(config.locale).format(amount);
    } catch {
      return String(amount);
    }
  }

  formatDate(date: Date | string | number, lang?: SupportedLanguage): string {
    const targetLang = lang || this.currentLanguage;
    const config = LOCALE_CONFIG[targetLang] || LOCALE_CONFIG[SupportedLanguage.ENGLISH];

    try {
      return new Intl.DateTimeFormat(config.locale, {
        dateStyle: 'medium',
      }).format(new Date(date));
    } catch {
      return new Date(date).toDateString();
    }
  }

  formatDateTime(date: Date | string | number, lang?: SupportedLanguage): string {
    const targetLang = lang || this.currentLanguage;
    const config = LOCALE_CONFIG[targetLang] || LOCALE_CONFIG[SupportedLanguage.ENGLISH];

    try {
      return new Intl.DateTimeFormat(config.locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(date));
    } catch {
      return new Date(date).toLocaleString();
    }
  }

  getAllSupportedLanguages(): SupportedLanguage[] {
    return Object.values(SupportedLanguage);
  }

  getLanguageNames(): Record<SupportedLanguage, string> {
    const { LANGUAGE_NAMES } = require('../types/language.types');
    return LANGUAGE_NAMES;
  }
}

export const i18nService = new I18nService();
