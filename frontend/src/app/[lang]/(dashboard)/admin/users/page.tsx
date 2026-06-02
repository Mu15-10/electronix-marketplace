'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Shield, Ban, MoreHorizontal } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@email.com', role: 'seller', status: 'active', verified: true, joined: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@email.com', role: 'user', status: 'active', verified: false, joined: '2024-02-01' },
  { id: '3', name: 'Bob Wilson', email: 'bob@email.com', role: 'seller', status: 'suspended', verified: true, joined: '2023-11-20' },
  { id: '4', name: 'Alice Brown', email: 'alice@email.com', role: 'admin', status: 'active', verified: true, joined: '2023-06-01' },
];

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">User Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input placeholder="Search users..." icon={<Search className="h-4 w-4" />} className="max-w-xs" />
        <Select options={[{ value: 'all', label: 'All Roles' }, { value: 'user', label: 'Users' }, { value: 'seller', label: 'Sellers' }, { value: 'admin', label: 'Admins' }]} />
        <Select options={[{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }, { value: 'banned', label: 'Banned' }]} />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">User</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Role</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Verified</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Joined</th>
                <th className="text-end px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-surface-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'seller' ? 'primary' : 'default'} size="sm">{u.role}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={u.status === 'active' ? 'success' : 'warning'} size="sm">{u.status}</Badge></td>
                  <td className="px-4 py-3">{u.verified ? <Shield className="h-4 w-4 text-primary-500" /> : '-'}</td>
                  <td className="px-4 py-3 text-sm text-surface-500">{u.joined}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm"><Shield className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Ban className="h-4 w-4" /></Button>
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
