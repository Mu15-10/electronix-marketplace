'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer group">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer',
              'dark:border-surface-600 dark:bg-surface-800',
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-white">
              {label}
            </span>
          )}
        </label>
        {error && <p className="text-sm text-danger-600 ms-6">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
