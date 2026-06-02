'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Search, Edit2, Eye, Plus, MoreHorizontal } from 'lucide-react';

const mockListings = [
  { id: '1', title: 'iPhone 15 Pro Max 256GB', price: 999, status: 'active', views: 234, sales: 3, date: '2024-01-15' },
  { id: '2', title: 'MacBook Air M2 15"', price: 1099, status: 'active', views: 189, sales: 1, date: '2024-01-20' },
  { id: '3', title: 'AirPods Pro 2nd Gen', price: 199, status: 'pending', views: 56, sales: 0, date: '2024-02-01' },
];

export default function SellerListingsPage() {
  const params = useParams();
  const lang = params.lang as string;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Listings</h1>
        <Link href={`/${lang}/dashboard/listings/create`}><Button><Plus className="h-4 w-4" /> Add Listing</Button></Link>
      </div>

      <div className="mb-4">
        <Input placeholder="Search listings..." icon={<Search className="h-4 w-4" />} />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Listing</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Price</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Views</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Sales</th>
                <th className="text-end px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockListings.map((l) => (
                <tr key={l.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white">{l.title}</td>
                  <td className="px-4 py-3 text-sm text-surface-900 dark:text-white">{formatPrice(l.price)}</td>
                  <td className="px-4 py-3"><Badge variant={l.status === 'active' ? 'success' : 'warning'} size="sm">{l.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-surface-500">{l.views}</td>
                  <td className="px-4 py-3 text-sm text-surface-500">{l.sales}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600"><Eye className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600"><MoreHorizontal className="h-4 w-4" /></button>
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
