'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const mockAlerts = [
  { id: '1', type: 'Suspicious Listing', item: 'iPhone 15 Pro - $299', risk: 'high', status: 'open', date: '2024-02-01' },
  { id: '2', type: 'Identity Mismatch', item: 'User #4582', risk: 'critical', status: 'investigating', date: '2024-01-31' },
  { id: '3', type: 'Unusual Activity', item: 'Multiple listings from same IP', risk: 'medium', status: 'open', date: '2024-01-30' },
];

export default function AdminFraudPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Fraud Detection Center</h1>

      <Card padding="none">
        <div className="divide-y divide-surface-100 dark:divide-surface-700">
          {mockAlerts.map((a) => (
            <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${a.risk === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : a.risk === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-warning-100 dark:bg-warning-900/30'}`}>
                <AlertTriangle className={`h-5 w-5 ${a.risk === 'critical' ? 'text-red-600' : a.risk === 'high' ? 'text-orange-600' : 'text-warning-600'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-surface-900 dark:text-white">{a.type}</p>
                <p className="text-xs text-surface-500">{a.item} · {a.date}</p>
              </div>
              <Badge variant={a.risk === 'critical' ? 'danger' : a.risk === 'high' ? 'warning' : 'info'} size="sm">{a.risk}</Badge>
              <Badge variant={a.status === 'open' ? 'warning' : 'info'} size="sm">{a.status}</Badge>
              <ChevronRight className="h-4 w-4 text-surface-400 rtl-flip" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
