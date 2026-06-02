'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Package, Scale, Shield, AlertTriangle, FileSearch, BarChart3, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { href: '', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/listings', icon: Package, label: 'Listings' },
  { href: '/disputes', icon: Scale, label: 'Disputes' },
  { href: '/verifications', icon: Shield, label: 'Verifications' },
  { href: '/fraud', icon: AlertTriangle, label: 'Fraud Alerts' },
  { href: '/audit', icon: FileSearch, label: 'Audit Logs' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function AdminSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'bg-white dark:bg-surface-800 border-e border-surface-200 dark:border-surface-700 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
        {!collapsed && <span className="font-bold text-surface-900 dark:text-white">Admin Panel</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {adminLinks.map((link) => {
          const href = `/${lang}/admin${link.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={link.href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700'
              )}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
