'use client';

import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function PriceDisplay({ price, originalPrice, currency = 'USD', size = 'md', className }: PriceDisplayProps) {
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-bold text-primary-600 dark:text-primary-400', sizes[size])}>
        {formatPrice(price, currency)}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className={cn('text-surface-400 line-through', size === 'lg' ? 'text-base' : 'text-sm')}>
            {formatPrice(originalPrice, currency)}
          </span>
          <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
