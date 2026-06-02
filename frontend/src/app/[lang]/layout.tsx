import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { dir } from '@/lib/i18n-config';
import { AuthProvider } from '@/providers/auth-provider';
import '../globals.css';
import { ReactNode } from 'react';

export async function generateMetadata({ params: { lang } }: { params: { lang: string } }) {
  return {
    title: 'Electronix - AI-Powered Electronics Marketplace',
    description: 'Buy and sell verified electronics with AI-powered fraud protection',
    openGraph: {
      title: 'Electronix Marketplace',
      description: 'Your trusted electronics marketplace',
    },
  };
}

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  let messages;
  try {
    messages = await getMessages(lang);
  } catch {
    const enMessages = (await import('@/messages/en.json')).default;
    messages = enMessages;
  }

  return (
    <html lang={lang} dir={dir(lang)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`min-h-screen bg-white dark:bg-surface-900 text-surface-900 dark:text-white ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages} locale={lang}>
            <AuthProvider>
              {children}
              <Toaster position={lang === 'ar' ? 'top-left' : 'top-right'} />
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
