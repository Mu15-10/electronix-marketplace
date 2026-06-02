'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ListingGrid } from '@/components/listings/listing-grid';
import { usersApi } from '@/lib/api';
import { Listing } from '@/types';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getWishlist()
      .then(res => setListings(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">My Wishlist</h1>
      <ListingGrid listings={listings} loading={loading} />
    </div>
  );
}
