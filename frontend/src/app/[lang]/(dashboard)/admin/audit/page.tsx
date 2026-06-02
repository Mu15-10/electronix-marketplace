'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, FileSearch } from 'lucide-react';

const mockLogs = [
  { id: '1', user: 'Admin', action: 'User suspended', resource: 'User #1234', ip: '192.168.1.1', date: '2024-02-01 14:30' },
  { id: '2', user: 'System', action: 'Listing approved', resource: 'Listing #5678', ip: '-', date: '2024-02-01 14:25' },
  { id: '3', user: 'Admin', action: 'Dispute resolved', resource: 'Dispute #DSP-001', ip: '192.168.1.1', date: '2024-02-01 14:20' },
];

export default function AdminAuditPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Audit Logs</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input placeholder="Search logs..." icon={<Search className="h-4 w-4" />} className="max-w-xs" />
        <Select options={[{ value: 'all', label: 'All Actions' }, { value: 'user', label: 'User Actions' }, { value: 'listing', label: 'Listing Actions' }, { value: 'dispute', label: 'Dispute Actions' }]} />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">User</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Action</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Resource</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">IP</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log) => (
                <tr key={log.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-4 py-3 text-sm text-surface-900 dark:text-white">{log.user}</td>
                  <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-surface-500">{log.resource}</td>
                  <td className="px-4 py-3 text-sm text-surface-500 font-mono">{log.ip}</td>
                  <td className="px-4 py-3 text-sm text-surface-400">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
