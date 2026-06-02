'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({ onSearch, className, placeholder = 'Search electronics...', autoFocus }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;

  const suggestions = query.length > 1
    ? ['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro M3', 'Sony WH-1000XM5', 'iPad Air'].filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      router.push(`/${lang}/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center bg-surface-100 dark:bg-surface-800 rounded-xl border-2 transition-all',
          isFocused ? 'border-primary-500 bg-white dark:bg-surface-700' : 'border-transparent'
        )}
      >
        <Search className="h-4 w-4 text-surface-400 ms-3 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="p-1.5 me-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-600">
            <X className="h-3.5 w-3.5 text-surface-400" />
          </button>
        )}
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 py-1 z-30">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={() => { setQuery(suggestion); onSearch?.(suggestion); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700"
            >
              <Search className="h-3.5 w-3.5 text-surface-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
