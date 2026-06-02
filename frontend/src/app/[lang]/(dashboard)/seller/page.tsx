'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Package, Star, Eye, ShoppingCart, Plus, ArrowRight } from 'lucide-react';

export default function SellerDashboardPage() {
  const params = useParams();
  const lang = params.lang as string;

  const stats = [
    { icon: Eye, label: 'Total Views', value: '1,234', change: '+12%', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: ShoppingCart, label: 'Orders', value: '56', change: '+8%', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: DollarSign, label: 'Revenue', value: '$12,450', change: '+23%', color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
    { icon: Star, label: 'Rating', value: '4.8', change: '+0.2', color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Seller Dashboard</h1>
          <p className="text-sm text-surface-500">Manage your sales and grow your business</p>
        </div>
        <Link href={`/${lang}/dashboard/listings/create`}>
          <Button><Plus className="h-4 w-4" /> New Listing</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{s.label}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{s.value}</p>
                <p className="text-xs text-green-600 mt-1">{s.change}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
                <div>
                  <p className="text-sm text-surface-900 dark:text-white">iPhone 15 Pro</p>
                  <p className="text-xs text-surface-400">Order #ORD-{1000 + i}</p>
                </div>
                <p className="text-sm font-medium text-green-600">+$999</p>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: `/${lang}/seller/listings`, icon: Package, label: 'My Listings' },
              { href: `/${lang}/seller/analytics`, icon: TrendingUp, label: 'Analytics' },
              { href: `/${lang}/seller/reviews`, icon: Star, label: 'Reviews' },
              { href: `/${lang}/seller/earnings`, icon: DollarSign, label: 'Earnings' },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-700/50 text-center card-hover">
                  <link.icon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-200">{link.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
