'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ChevronRight } from 'lucide-react';

const mockOrders = [
  { id: 'ORD-001', listing: 'iPhone 15 Pro Max', amount: 999, currency: 'USD', status: 'completed', date: '2024-01-15', seller: 'TechStore' },
  { id: 'ORD-002', listing: 'MacBook Air M2', amount: 899, currency: 'USD', status: 'shipped', date: '2024-02-01', seller: 'AppleReseller' },
  { id: 'ORD-003', listing: 'AirPods Pro 2', amount: 199, currency: 'USD', status: 'paid', date: '2024-02-10', seller: 'GadgetHub' },
];

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">My Orders</h1>

      <Tabs defaultValue="all">
        <TabList>
          <Tab value="all">All</Tab>
          <Tab value="active">Active</Tab>
          <Tab value="completed">Completed</Tab>
          <Tab value="cancelled">Cancelled</Tab>
        </TabList>

        <TabPanel value="all">
          <Card padding="none">
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {mockOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <div className="h-12 w-12 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                    <Package className="h-6 w-6 text-surface-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{order.listing}</p>
                    <p className="text-xs text-surface-500">Order #{order.id} · {order.seller}</p>
                    <p className="text-xs text-surface-400">{formatDate(order.date)}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{formatPrice(order.amount, order.currency)}</p>
                    <Badge variant={order.status === 'completed' ? 'success' : order.status === 'shipped' ? 'info' : 'warning'} size="sm">{order.status}</Badge>
                  </div>
                  <ChevronRight className="h-5 w-5 text-surface-400 rtl-flip" />
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>
        <TabPanel value="active"><p className="text-surface-500 text-sm">Active orders will appear here.</p></TabPanel>
        <TabPanel value="completed"><p className="text-surface-500 text-sm">Completed orders will appear here.</p></TabPanel>
        <TabPanel value="cancelled"><p className="text-surface-500 text-sm">Cancelled orders will appear here.</p></TabPanel>
      </Tabs>
    </div>
  );
}
