'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { X, LayoutDashboard, Package, ShoppingCart, Heart, Settings, MessageSquare, Shield, User, LogOut, Store, HelpCircle } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;
  const { user, isAuthenticated, logout } = useAuthStore();

  const links = isAuthenticated
    ? [
        { href: `/${lang}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
        { href: `/${lang}/dashboard/listings`, icon: Package, label: 'My Listings' },
        { href: `/${lang}/dashboard/orders`, icon: ShoppingCart, label: 'Orders' },
        { href: `/${lang}/dashboard/chat`, icon: MessageSquare, label: 'Messages' },
        { href: `/${lang}/dashboard/wishlist`, icon: Heart, label: 'Wishlist' },
        { href: `/${lang}/seller`, icon: Store, label: 'Seller Dashboard' },
        { href: `/${lang}/dashboard/settings`, icon: Settings, label: 'Settings' },
      ]
    : [];

  const publicLinks = [
    { href: `/${lang}/listings`, icon: Package, label: 'Browse' },
    { href: `/${lang}/categories`, icon: Package, label: 'Categories' },
    { href: `/${lang}/faq`, icon: HelpCircle, label: 'FAQ' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 w-72 bg-white dark:bg-surface-900 shadow-2xl transform transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
          <Link href={`/${lang}`} className="flex items-center gap-2" onClick={onClose}>
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-surface-900 dark:text-white">Electronix</span>
          </Link>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAuthenticated && user && (
          <Link
            href={`/${lang}/dashboard`}
            onClick={onClose}
            className="flex items-center gap-3 p-4 border-b border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800"
          >
            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{user.full_name}</p>
              <p className="text-xs text-surface-500">{user.email}</p>
            </div>
          </Link>
        )}

        <nav className="p-3 space-y-1 overflow-y-auto">
          {isAuthenticated && (
            <>
              <p className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">Menu</p>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-surface-200 dark:border-surface-700" />
            </>
          )}

          <p className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
            {isAuthenticated ? 'Explore' : 'Menu'}
          </p>
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900">
          {isAuthenticated ? (
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <Link href={`/${lang}/login`} onClick={onClose} className="flex-1 px-3 py-2.5 text-sm font-medium text-center rounded-lg border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800">
                Login
              </Link>
              <Link href={`/${lang}/register`} onClick={onClose} className="flex-1 px-3 py-2.5 text-sm font-medium text-center rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
