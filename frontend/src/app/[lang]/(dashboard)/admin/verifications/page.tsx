'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Check, X, FileText } from 'lucide-react';

const mockVerifications = [
  { id: '1', user: 'John Doe', type: 'ID Card', status: 'pending', date: '2024-02-01' },
  { id: '2', user: 'Jane Smith', type: 'Passport', status: 'pending', date: '2024-01-30' },
  { id: '3', user: 'Bob Wilson', type: 'License', status: 'approved', date: '2024-01-25' },
];

export default function AdminVerificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Verification Queue</h1>

      <Card padding="none">
        <div className="divide-y divide-surface-100 dark:divide-surface-700">
          {mockVerifications.map((v) => (
            <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
              <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-surface-900 dark:text-white">{v.user}</p>
                <p className="text-xs text-surface-500">{v.type} · {v.date}</p>
              </div>
              <Badge variant={v.status === 'pending' ? 'warning' : 'success'} size="sm">{v.status}</Badge>
              {v.status === 'pending' && (
                <div className="flex gap-1">
                  <Button size="sm" variant="primary"><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="danger"><X className="h-4 w-4" /></Button>
                </div>
              )}
              <Button size="sm" variant="ghost"><FileText className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
