'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { Search, Check, X, Flag, MoreHorizontal } from 'lucide-react';

const mockListings = [
  { id: '1', title: 'iPhone 15 Pro Max', seller: 'TechStore', price: 999, status: 'pending', date: '2024-02-01' },
  { id: '2', title: 'MacBook Air M2', seller: 'AppleReseller', price: 1099, status: 'active', date: '2024-01-28' },
  { id: '3', title: 'Samsung Galaxy S24', seller: 'GadgetHub', status: 'flagged', price: 899, date: '2024-02-02' },
];

export default function AdminListingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Listing Moderation</h1>

      <div className="flex gap-3 mb-6">
        <Input placeholder="Search listings..." icon={<Search className="h-4 w-4" />} className="max-w-xs" />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Listing</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Seller</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Price</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Date</th>
                <th className="text-end px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockListings.map((l) => (
                <tr key={l.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white">{l.title}</td>
                  <td className="px-4 py-3 text-sm text-surface-500">{l.seller}</td>
                  <td className="px-4 py-3 text-sm text-surface-900 dark:text-white">{formatPrice(l.price)}</td>
                  <td className="px-4 py-3"><Badge variant={l.status === 'active' ? 'success' : l.status === 'pending' ? 'warning' : 'danger'} size="sm">{l.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-surface-500">{l.date}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex justify-end gap-1">
                      {l.status === 'pending' && <><Button variant="ghost" size="sm"><Check className="h-4 w-4 text-green-600" /></Button><Button variant="ghost" size="sm"><X className="h-4 w-4 text-red-600" /></Button></>}
                      {l.status === 'active' && <Button variant="ghost" size="sm"><Flag className="h-4 w-4 text-warning-600" /></Button>}
                      <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
