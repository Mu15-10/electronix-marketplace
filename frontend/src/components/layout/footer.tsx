'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export function Footer() {
  const params = useParams();
  const lang = params.lang as string;
  const t = useTranslations();

  const footerLinks = [
    {
      title: 'Marketplace',
      links: [
        { href: `/${lang}/listings`, label: 'Browse Listings' },
        { href: `/${lang}/categories`, label: 'Categories' },
        { href: `/${lang}/search`, label: 'Search' },
        { href: `/${lang}/sellers`, label: 'Top Sellers' },
      ],
    },
    {
      title: 'Support',
      links: [
        { href: `/${lang}/faq`, label: 'FAQ' },
        { href: `/${lang}/contact`, label: 'Contact Us' },
        { href: `/${lang}/help`, label: 'Help Center' },
        { href: `/${lang}/disputes`, label: 'Dispute Resolution' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: `/${lang}/about`, label: 'About Us' },
        { href: `/${lang}/terms`, label: 'Terms of Service' },
        { href: `/${lang}/privacy`, label: 'Privacy Policy' },
        { href: `/${lang}/blog`, label: 'Blog' },
      ],
    },
  ];

  return (
    <footer className="bg-surface-900 dark:bg-surface-950 text-surface-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href={`/${lang}`} className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold text-white">Electronix</span>
            </Link>
            <p className="text-sm text-surface-400 mb-4 max-w-sm">
              The AI-powered marketplace for verified electronics. Buy and sell with confidence.
            </p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-9 w-9 rounded-lg bg-surface-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs uppercase font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            &copy; {new Date().getFullYear()} Electronix Marketplace. All rights reserved.
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
