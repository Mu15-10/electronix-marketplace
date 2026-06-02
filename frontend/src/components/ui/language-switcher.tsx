'use client';

import { useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags, getLocaleName } from '@/lib/i18n-config';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = (params.lang as string) || 'en';
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (lang: string) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
    router.push(newPath);
    setIsOpen(false);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeFlags[currentLang as keyof typeof localeFlags]} {getLocaleName(currentLang)}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute end-0 mt-1 w-44 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 py-1 z-20 animate-scale-in">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors',
                  locale === currentLang
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700'
                )}
              >
                <span className="text-base">{localeFlags[locale]}</span>
                <span className="flex-1 text-start">{localeNames[locale]}</span>
                {locale === currentLang && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
