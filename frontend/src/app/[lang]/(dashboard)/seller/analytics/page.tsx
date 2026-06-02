'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { TrendingUp, Eye, ShoppingCart, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';

export default function SellerAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Views', value: '12,430', change: '+15%', up: true, icon: Eye },
          { label: 'Conversion Rate', value: '3.2%', change: '+0.8%', up: true, icon: TrendingUp },
          { label: 'Avg. Order Value', value: '$845', change: '-5%', up: false, icon: ShoppingCart },
          { label: 'Revenue', value: '$18,430', change: '+22%', up: true, icon: DollarSign },
        ].map((s, i) => (
          <Card key={i} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{s.label}</p>
                <p className="text-xl font-bold text-surface-900 dark:text-white mt-1">{s.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${s.up ? 'text-green-600' : 'text-red-600'}`}>
                  {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {s.change}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-surface-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Views Over Time</h3>
          <div className="h-48 flex items-center justify-center text-surface-400 text-sm bg-surface-50 dark:bg-surface-700/30 rounded-lg">
            Chart coming soon (recharts)
          </div>
        </Card>
        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Revenue Over Time</h3>
          <div className="h-48 flex items-center justify-center text-surface-400 text-sm bg-surface-50 dark:bg-surface-700/30 rounded-lg">
            Chart coming soon (recharts)
          </div>
        </Card>
      </div>
    </div>
  );
}
