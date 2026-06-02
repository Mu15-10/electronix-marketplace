'use client';

import { Card } from '@/components/ui/card';
import { Users, Package, Scale, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { icon: Users, label: 'Total Users', value: '45,230', change: '+12%', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Package, label: 'Total Listings', value: '12,450', change: '+8%', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: DollarSign, label: 'Revenue', value: '$128K', change: '+23%', color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
    { icon: Scale, label: 'Open Disputes', value: '23', change: '-5%', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { icon: AlertTriangle, label: 'Fraud Alerts', value: '12', change: '+3', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: TrendingUp, label: 'Conversion', value: '3.2%', change: '+0.5%', color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm text-primary-700">U{i}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">User {i}</p>
                  <p className="text-xs text-surface-400">user{i}@email.com</p>
                </div>
                <span className="text-xs text-surface-400">2h ago</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'New user registered', time: '5m ago' },
              { action: 'Listing #1234 approved', time: '15m ago' },
              { action: 'Dispute #DSP-002 opened', time: '1h ago' },
              { action: 'Verification request approved', time: '2h ago' },
              { action: 'Fraud alert resolved', time: '3h ago' },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
                <p className="text-sm text-surface-600 dark:text-surface-300">{a.action}</p>
                <span className="text-xs text-surface-400">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
