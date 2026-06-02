'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ListingGrid } from '@/components/listings/listing-grid';
import { SearchFiltersForm } from '@/components/search/search-filters';
import { Pagination } from '@/components/ui/pagination';
import { listingsApi } from '@/lib/api';
import { Listing } from '@/types';

export default function SearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const query = searchParams.get('q') || '';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    listingsApi.search(query, { page: String(page), limit: '12' })
      .then(res => { setListings(res.data.results || res.data); setTotal(res.data.count || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query, page]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Results for "{query}"
          </h1>
          <p className="text-sm text-surface-500">{total} items found</p>
        </div>
        <div className="flex gap-6">
          <aside className="w-64 shrink-0 hidden lg:block">
            <SearchFiltersForm onApply={() => {}} />
          </aside>
          <div className="flex-1">
            <ListingGrid listings={listings} loading={loading} />
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={Math.ceil(total / 12)} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
