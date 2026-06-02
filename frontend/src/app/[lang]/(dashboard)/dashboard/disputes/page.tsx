'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Scale, ChevronRight } from 'lucide-react';

const mockDisputes = [
  { id: 'DSP-001', order: 'ORD-001', reason: 'Item not as described', status: 'open', date: '2024-02-01' },
];

export default function DisputesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">My Disputes</h1>

      {mockDisputes.length === 0 ? (
        <EmptyState icon={<Scale className="h-16 w-16" />} title="No disputes" description="You have no active disputes" />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {mockDisputes.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{d.id}</p>
                  <p className="text-xs text-surface-500">{d.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={d.status === 'open' ? 'warning' : 'default'}>{d.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-surface-400 rtl-flip" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
