'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, ConditionBadge } from '@/components/ui/badge';
import { listingsApi } from '@/lib/api';
import { Listing } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { Plus, Edit2, Trash2, Eye, MoreHorizontal } from 'lucide-react';

export default function MyListingsPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getMyListings()
      .then(res => setListings(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Listings</h1>
          <p className="text-sm text-surface-500">{listings.length} listings</p>
        </div>
        <Link href={`/${lang}/dashboard/listings/create`}>
          <Button><Plus className="h-4 w-4" /> Create Listing</Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Listing</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Price</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Views</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Date</th>
                <th className="text-end px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-100 dark:border-surface-700">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></td>
                  ))}
                </tr>
              )) : listings.map((listing) => (
                <tr key={listing.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                        {listing.images?.[0] && <img src={listing.images[0].thumbnail} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate max-w-[200px]">{listing.title}</p>
                        <p className="text-xs text-surface-500">{listing.brand} {listing.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white">{formatPrice(listing.price, listing.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={listing.status === 'active' ? 'success' : listing.status === 'pending' ? 'warning' : 'default'} size="sm">
                      {listing.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-500">{listing.views_count}</td>
                  <td className="px-4 py-3 text-sm text-surface-500">{formatRelativeTime(listing.created_at)}</td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/${lang}/listings/${listing.id}`}>
                        <button className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-700"><Eye className="h-4 w-4" /></button>
                      </Link>
                      <Link href={`/${lang}/dashboard/listings/${listing.id}/edit`}>
                        <button className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-700"><Edit2 className="h-4 w-4" /></button>
                      </Link>
                      <button className="p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-surface-100 dark:hover:bg-surface-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
