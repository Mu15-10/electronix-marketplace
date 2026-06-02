'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  children: ReactNode;
  className?: string;
  type?: 'single' | 'multiple';
}

export function Accordion({ children, className, type = 'single' }: AccordionProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-start bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
      >
        <span className="text-sm font-medium text-surface-900 dark:text-white">{title}</span>
        <ChevronDown className={cn('h-5 w-5 text-surface-400 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 bg-white dark:bg-surface-800">
          <p className="text-sm text-surface-600 dark:text-surface-300">{children}</p>
        </div>
      )}
    </div>
  );
}
