'use client';

import { Listing } from '@/types';
import { ListingCard } from './listing-card';
import { ListingCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface ListingGridProps {
  listings: Listing[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridCols = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function ListingGrid({ listings, loading, columns = 4, className }: ListingGridProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-4 sm:gap-6', gridCols[columns], className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <EmptyState
        title="No listings found"
        description="Try adjusting your search or filter criteria"
      />
    );
  }

  return (
    <div className={cn('grid gap-4 sm:gap-6', gridCols[columns], className)}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
