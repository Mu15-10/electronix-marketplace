'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { SearchInput } from '@/components/ui/search-input';
import {
  Menu, X, Bell, ShoppingCart, Heart, Plus, ChevronDown, LogOut, User, Settings, Package, MessagesSquare,
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const navLinks = [
    { href: `/${lang}/listings`, label: 'Browse' },
    { href: `/${lang}/categories`, label: 'Categories' },
    { href: `/${lang}/sellers`, label: 'Sellers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="hidden sm:block text-lg font-bold text-surface-900 dark:text-white">
                Electronix
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 ms-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchInput
              onSearch={(q) => router.push(`/${lang}/search?q=${encodeURIComponent(q)}`)}
            />
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push(`/${lang}/dashboard/wishlist`)}
                  className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  <Heart className="h-5 w-5" />
                </button>

                <button className="relative p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-danger-500 text-white text-[10px] flex items-center justify-center font-medium">
                    3
                  </span>
                </button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => router.push(`/${lang}/dashboard/listings/create`)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sell</span>
                </Button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
                  >
                    <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
                    <ChevronDown className="hidden sm:block h-4 w-4 text-surface-400" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 py-1 z-20 animate-scale-in">
                        <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                            {user?.full_name}
                          </p>
                          <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          href={`/${lang}/dashboard`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700"
                        >
                          <User className="h-4 w-4" /> Dashboard
                        </Link>
                        <Link
                          href={`/${lang}/dashboard/listings`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700"
                        >
                          <Package className="h-4 w-4" /> My Listings
                        </Link>
                        <Link
                          href={`/${lang}/dashboard/orders`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700"
                        >
                          <ShoppingCart className="h-4 w-4" /> Orders
                        </Link>
                        <Link
                          href={`/${lang}/dashboard/chat`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700"
                        >
                          <MessagesSquare className="h-4 w-4" /> Messages
                        </Link>
                        <Link
                          href={`/${lang}/dashboard/settings`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700"
                        >
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <hr className="border-surface-200 dark:border-surface-700" />
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-surface-50 dark:hover:bg-surface-700"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={`/${lang}/login`}>
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href={`/${lang}/register`}>
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div className="md:hidden p-4 border-t border-surface-200 dark:border-surface-700">
          <SearchInput onSearch={(q) => { router.push(`/${lang}/search?q=${encodeURIComponent(q)}`); setShowMobileSearch(false); }} />
        </div>
      )}
    </header>
  );
}
