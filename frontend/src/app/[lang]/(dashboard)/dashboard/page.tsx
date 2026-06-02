'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { DashboardStats } from '@/types';
import { Package, ShoppingCart, Eye, Star, TrendingUp, DollarSign, MessageSquare, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const lang = params.lang as string;
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const statCards = [
    { icon: Package, label: 'Active Listings', value: stats?.active_listings || 0, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { icon: ShoppingCart, label: 'Total Orders', value: stats?.total_orders || 0, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: Eye, label: 'Total Views', value: '1.2K', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: DollarSign, label: 'Total Revenue', value: stats?.total_revenue ? `$${stats.total_revenue}` : '$0', color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-surface-500">Welcome back, {user?.full_name || 'User'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <Card key={idx} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{card.label}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
                <div className="h-8 w-8 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                  {i % 2 === 0 ? <ShoppingCart className="h-4 w-4 text-surface-500" /> : <Eye className="h-4 w-4 text-surface-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-surface-700 dark:text-surface-200">Listing #{1000 + i} was viewed</p>
                  <p className="text-xs text-surface-400">{i * 5} minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/${lang}/dashboard/listings/create`}>
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-center card-hover">
                <Package className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">Create Listing</p>
              </div>
            </Link>
            <Link href={`/${lang}/dashboard/chat`}>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center card-hover">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Messages</p>
              </div>
            </Link>
            <Link href={`/${lang}/seller`}>
              <div className="p-4 rounded-xl bg-warning-50 dark:bg-warning-900/20 text-center card-hover">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-warning-600" />
                <p className="text-sm font-medium text-warning-700 dark:text-warning-300">Analytics</p>
              </div>
            </Link>
            <Link href={`/${lang}/dashboard/settings`}>
              <div className="p-4 rounded-xl bg-surface-100 dark:bg-surface-700 text-center card-hover">
                <Star className="h-6 w-6 mx-auto mb-2 text-surface-600" />
                <p className="text-sm font-medium text-surface-700 dark:text-surface-200">Settings</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
