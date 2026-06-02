import * as fs from 'fs';
import * as path from 'path';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/language.types';
import { TranslationSchema } from '../types/translation-namespace.types';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export class I18nLoader {
  private static instances: Map<string, I18nLoader> = new Map();
  private cache: Map<string, DeepPartial<TranslationSchema>> = new Map();
  private basePath: string;

  private constructor(basePath?: string) {
    this.basePath = basePath || path.join(__dirname, '..', 'locales');
  }

  static getInstance(basePath?: string): I18nLoader {
    const key = basePath || 'default';
    if (!I18nLoader.instances.has(key)) {
      I18nLoader.instances.set(key, new I18nLoader(basePath));
    }
    return I18nLoader.instances.get(key)!;
  }

  loadLanguageSync(lang: SupportedLanguage): DeepPartial<TranslationSchema> {
    const cached = this.cache.get(lang);
    if (cached) return cached;

    const langPath = path.join(this.basePath, lang);
    const translations: DeepPartial<TranslationSchema> = {};

    if (!fs.existsSync(langPath)) {
      console.warn(`Language directory not found: ${langPath}`);
      return {};
    }

    const files = fs.readdirSync(langPath).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(langPath, file), 'utf-8');
        const namespace = file.replace('.json', '');
        translations[namespace as keyof TranslationSchema] = JSON.parse(content);
      } catch (err) {
        console.error(`Failed to load translation file: ${file}`, err);
      }
    }

    this.cache.set(lang, translations);
    return translations;
  }

  async loadLanguage(lang: SupportedLanguage): Promise<DeepPartial<TranslationSchema>> {
    return this.loadLanguageSync(lang);
  }

  loadAllLanguages(): Map<SupportedLanguage, DeepPartial<TranslationSchema>> {
    const result = new Map<SupportedLanguage, DeepPartial<TranslationSchema>>();
    for (const lang of SUPPORTED_LANGUAGES) {
      result.set(lang, this.loadLanguageSync(lang));
    }
    return result;
  }

  preloadAll(): void {
    this.loadAllLanguages();
  }

  clearCache(): void {
    this.cache.clear();
  }
}
