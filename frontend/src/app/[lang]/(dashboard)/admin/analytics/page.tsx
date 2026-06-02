'use client';

import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Platform Analytics</h1>
        <Select options={[{ value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }, { value: '90d', label: 'Last 90 days' }, { value: '1y', label: 'Last year' }]} className="w-40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'New Users', value: '+234', change: '+12%', color: 'text-blue-600', bg: 'bg-blue-100' },
          { icon: Package, label: 'New Listings', value: '+89', change: '+8%', color: 'text-green-600', bg: 'bg-green-100' },
          { icon: TrendingUp, label: 'Transactions', value: '+456', change: '+23%', color: 'text-warning-600', bg: 'bg-warning-100' },
          { icon: DollarSign, label: 'Revenue', value: '+$12,450', change: '+18%', color: 'text-primary-600', bg: 'bg-primary-100' },
        ].map((s, i) => (
          <Card key={i} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{s.label}</p>
                <p className="text-xl font-bold text-surface-900 dark:text-white mt-1">{s.value}</p>
                <p className="text-xs text-green-600 mt-1">{s.change}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${s.bg} dark:opacity-80 flex items-center justify-center`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Revenue Overview</h3>
          <div className="h-64 flex items-center justify-center text-surface-400 bg-surface-50 dark:bg-surface-700/30 rounded-lg">Chart (recharts)</div>
        </Card>
        <Card padding="lg">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center text-surface-400 bg-surface-50 dark:bg-surface-700/30 rounded-lg">Chart (recharts)</div>
        </Card>
      </div>
    </div>
  );
}
