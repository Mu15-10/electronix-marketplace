'use client';

import { useState, ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
