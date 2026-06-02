'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Listing } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { ConditionBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Heart, MapPin, Eye } from 'lucide-react';
import { useState } from 'react';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const params = useParams();
  const lang = params.lang as string;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const primaryImage = listing.images?.find((img) => img.is_primary) || listing.images?.[0];

  return (
    <div className={cn('group bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden card-hover', className)}>
      <Link href={`/${lang}/listings/${listing.id}`}>
        <div className="relative h-48 bg-surface-100 dark:bg-surface-700 overflow-hidden">
          {primaryImage ? (
            <Image src={primaryImage.url} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
          ) : (
            <div className="flex items-center justify-center h-full text-surface-300 dark:text-surface-600">
              <Eye className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 start-2">
            <ConditionBadge condition={listing.condition} />
          </div>
          {listing.is_featured && (
            <div className="absolute top-2 end-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning-400 text-warning-900">Featured</span>
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
            className={cn('absolute bottom-2 end-2 p-1.5 rounded-full bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm transition-colors', isWishlisted ? 'text-danger-500' : 'text-surface-400 hover:text-danger-500')}
          >
            <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
          </button>
        </div>
      </Link>

      <Link href={`/${lang}/listings/${listing.id}`}>
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white line-clamp-1">
              {listing.title}
            </h3>
          </div>

          <p className="text-xs text-surface-500 mb-2 line-clamp-1">
            {listing.brand} {listing.model}{listing.variant ? ` - ${listing.variant}` : ''}
          </p>

          <div className="flex items-center gap-1 text-xs text-surface-400 mb-2">
            <MapPin className="h-3 w-3" />
            <span>{listing.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(listing.price, listing.currency)}
              </span>
              {listing.original_price && listing.original_price > listing.price && (
                <span className="text-xs text-surface-400 line-through ms-1">
                  {formatPrice(listing.original_price, listing.currency)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-surface-400">
              <Eye className="h-3 w-3" />
              <span>{listing.views_count}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
            <Avatar src={listing.seller?.avatar} name={listing.seller?.full_name} size="sm" />
            <span className="text-xs text-surface-600 dark:text-surface-400 truncate">
              {listing.seller?.full_name}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
