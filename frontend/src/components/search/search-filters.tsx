'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchFilters as SearchFiltersType } from '@/types';
import { RotateCcw } from 'lucide-react';

interface SearchFiltersProps {
  onApply: (filters: Partial<SearchFiltersType>) => void;
  initialValues?: Partial<SearchFiltersType>;
}

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export function SearchFiltersForm({ onApply, initialValues }: SearchFiltersProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onApply)} className="space-y-4">
      <Input label="Brand" placeholder="e.g. Apple, Samsung" {...register('brand')} />
      <Input label="Model" placeholder="e.g. iPhone 15" {...register('model')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Min Price" type="number" placeholder="$0" {...register('min_price', { valueAsNumber: true })} />
        <Input label="Max Price" type="number" placeholder="$9999" {...register('max_price', { valueAsNumber: true })} />
      </div>
      <Select label="Condition" options={conditions} placeholder="Any" {...register('condition')} />
      <Input label="Location" placeholder="City or country" {...register('location')} />
      <Select label="Sort By" options={sortOptions} {...register('sort_by')} />
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">Apply Filters</Button>
        <Button type="button" variant="outline" onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
