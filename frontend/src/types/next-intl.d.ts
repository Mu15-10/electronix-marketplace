declare module 'next-intl' {
  import { ReactNode } from 'react';
  export interface IntlConfig {
    locale: string;
    messages: Record<string, any>;
    timeZone?: string;
    now?: Date;
    formats?: any;
    defaultTranslationValues?: Record<string, any>;
    onError?: (error: any) => void;
    getMessageFallback?: (info: { namespace?: string; key: string; error: any }) => string;
  }
  export function useTranslations(namespace?: string): (key: string, values?: Record<string, any>) => string;
  export function useLocale(): string;
  export function useNow(options?: { updateInterval?: number }): Date;
  export function useTimeZone(): string | undefined;
  export function NextIntlClientProvider(props: IntlConfig & { children: ReactNode }): JSX.Element;
}

declare module 'next-intl/server' {
  export function getMessages(locale?: string): Promise<Record<string, any>>;
  export function getLocale(): Promise<string>;
  export function getTranslations(namespace?: string): Promise<(key: string, values?: Record<string, any>) => string>;
  export function getFormatter(): Promise<any>;
  export function getNow(): Promise<Date>;
  export function getTimeZone(): Promise<string>;
  export function getRequestConfig(config: (params: { locale: string; request: Request }) => Promise<{ locale: string; messages: Record<string, any>; timeZone?: string; now?: Date }>): any;
}

declare module 'next-intl/middleware' {
  import { NextMiddleware } from 'next/server';
  interface MiddlewareConfig {
    locales: readonly string[];
    defaultLocale: string;
    localePrefix?: 'as-needed' | 'always' | 'never';
    localeDetection?: boolean;
    alternateLinks?: boolean;
  }
  export default function createMiddleware(config: MiddlewareConfig): NextMiddleware;
}

declare module 'next-intl/navigation' {
  export function createSharedPathnamesNavigation(config: { locales: string[]; localePrefix?: 'as-needed' | 'always' | 'never' }): {
    Link: any;
    redirect: (path: string) => never;
    usePathname: () => string;
    useRouter: () => { push: (href: string) => void; replace: (href: string) => void; prefetch: (href: string) => void };
    permanentRedirect: (path: string) => never;
  };
}

declare module 'next-intl/routing' {
  export function defineRouting(config: {
    locales: string[];
    defaultLocale: string;
    localePrefix?: 'as-needed' | 'always' | 'never';
    localeDetection?: boolean;
  }): any;
}

declare module 'next-intl/plugin' {
  const plugin: (path: string) => (config: any) => any;
  export default plugin;
}
