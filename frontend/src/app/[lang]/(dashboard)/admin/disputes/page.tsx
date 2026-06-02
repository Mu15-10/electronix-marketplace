'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scale, ChevronRight } from 'lucide-react';

const mockDisputes = [
  { id: 'DSP-001', order: 'ORD-1234', reason: 'Item not as described', status: 'open', priority: 'high', date: '2024-02-01' },
  { id: 'DSP-002', order: 'ORD-1235', reason: 'Seller not responding', status: 'investigating', priority: 'medium', date: '2024-01-28' },
  { id: 'DSP-003', order: 'ORD-1236', reason: 'Payment issue', status: 'resolved', priority: 'low', date: '2024-01-25' },
];

export default function AdminDisputesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Dispute Management</h1>

      <Card padding="none">
        <div className="divide-y divide-surface-100 dark:divide-surface-700">
          {mockDisputes.map((d) => (
            <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
              <div className="h-10 w-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                <Scale className="h-5 w-5 text-surface-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-surface-900 dark:text-white">{d.id} - {d.reason}</p>
                <p className="text-xs text-surface-500">Order {d.order} · {d.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={d.priority === 'high' ? 'danger' : d.priority === 'medium' ? 'warning' : 'default'} size="sm">{d.priority}</Badge>
                <Badge variant={d.status === 'open' ? 'warning' : d.status === 'investigating' ? 'info' : 'success'} size="sm">{d.status}</Badge>
                <ChevronRight className="h-4 w-4 text-surface-400 rtl-flip" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
