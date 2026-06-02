'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  readOnly?: boolean;
}

const sizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function Rating({ value, max = 5, onChange, size = 'md', showValue, readOnly = false }: RatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex" role={readOnly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value} out of ${max}`}>
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const filled = starValue <= Math.round(value);
          const halfFilled = !filled && starValue - 0.5 <= value;

          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(starValue)}
              className={cn(
                'transition-colors',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
                filled || halfFilled ? 'text-warning-400' : 'text-surface-300 dark:text-surface-600'
              )}
              role={readOnly ? undefined : 'radio'}
              aria-checked={readOnly ? undefined : starValue === Math.round(value)}
              aria-label={readOnly ? undefined : `${starValue} star`}
            >
              <Star
                className={cn(
                  sizes[size],
                  halfFilled && 'fill-warning-400/50'
                )}
                fill={filled ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-surface-600 dark:text-surface-400 ms-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
