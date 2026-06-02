'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare, Heart, Settings, Star, Scale, Store,
  ChevronRight, Home, Megaphone, Gavel, Radio, LifeBuoy, CreditCard, DollarSign,
  Medal, UserPlus, TrendingUp, BarChart3, Truck, ShieldCheck, Search,
} from 'lucide-react';

const sidebarLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/listings', icon: Package, label: 'My Listings' },
  { href: '/dashboard/advertising', icon: Megaphone, label: 'Advertising' },
  { href: '/dashboard/auctions', icon: Gavel, label: 'Auctions' },
  { href: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/dashboard/loyalty', icon: Medal, label: 'Loyalty' },
  { href: '/dashboard/referrals', icon: UserPlus, label: 'Referrals' },
  { href: '/dashboard/reviews', icon: Star, label: 'Reviews' },
  { href: '/dashboard/pricing', icon: TrendingUp, label: 'Pricing' },
  { href: '/dashboard/shipping', icon: Truck, label: 'Shipping' },
  { href: '/dashboard/warranty', icon: ShieldCheck, label: 'Warranty' },
  { href: '/dashboard/inspection', icon: Search, label: 'Inspections' },
  { href: '/dashboard/disputes', icon: Scale, label: 'Disputes' },
  { href: '/dashboard/support', icon: LifeBuoy, label: 'Support' },
  { href: '/dashboard/subscription', icon: CreditCard, label: 'Subscription' },
  { href: '/seller', icon: Store, label: 'Seller Dashboard' },
  { href: '/seller/shipping', icon: Truck, label: 'Seller Shipping' },
  { href: '/seller/inspection', icon: Search, label: 'Seller Inspections' },
  { href: '/seller/commission', icon: DollarSign, label: 'Commission' },
  { href: '/seller/intelligence', icon: BarChart3, label: 'Market Intel' },
  { href: '/seller/streams', icon: Radio, label: 'Live Streams' },
  { href: '/admin/warranty', icon: ShieldCheck, label: 'Admin Warranty' },
  { href: '/admin/inspection', icon: Search, label: 'Admin Inspections' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === `/${lang}${href}` || pathname.startsWith(`/${lang}${href}/`);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <Header onMenuToggle={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex">
        <aside className="hidden lg:block w-64 shrink-0 border-e border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 min-h-[calc(100vh-4rem)]">
          <nav className="p-3 space-y-1 sticky top-20">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={`/${lang}${link.href}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
