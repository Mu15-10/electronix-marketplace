'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, ArrowUpRight, Wallet, Banknote, Plus } from 'lucide-react';

export default function SellerEarningsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Earnings & Payouts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card padding="lg">
          <p className="text-sm text-surface-500 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">$2,450.00</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3" /> +$340 this month
          </div>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-surface-500 mb-1">Pending Payout</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">$890.00</p>
          <p className="text-xs text-surface-400 mt-1">Estimated clearance in 3 days</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-surface-500 mb-1">Total Earned</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">$18,430.00</p>
          <p className="text-xs text-surface-400 mt-1">Lifetime earnings</p>
        </Card>
      </div>

      <Card padding="md" className="mb-6">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Payout Method</h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Banknote className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Bank Account</p>
              <p className="text-sm text-surface-500">**** 4532 · Chase Bank</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </div>
      </Card>

      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 dark:text-white">Payout History</h3>
          <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Request Payout</Button>
        </div>
        <div className="space-y-3">
          {[
            { date: 'Jan 15, 2024', amount: '$1,200', status: 'completed' },
            { date: 'Jan 01, 2024', amount: '$890', status: 'completed' },
            { date: 'Dec 15, 2023', amount: '$2,100', status: 'completed' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
              <span className="text-sm text-surface-600 dark:text-surface-300">{p.date}</span>
              <span className="text-sm font-medium text-surface-900 dark:text-white">{p.amount}</span>
              <span className="text-xs text-green-600">{p.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
