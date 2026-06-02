'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ListingGrid } from '@/components/listings/listing-grid';
import { SearchFiltersForm } from '@/components/search/search-filters';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { listingsApi } from '@/lib/api';
import { Listing, SearchFilters } from '@/types';
import { SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';

export default function ListingsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchListings = async (filters?: Partial<SearchFilters>) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), page_size: '12' };
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== null) { params[k] = String(v); } });
      }
      const res = await listingsApi.getAll(params);
      setListings(res.data.results || res.data);
      setTotal(res.data.count || 0);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">All Listings</h1>
            <p className="text-sm text-surface-500">{total} items found</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-surface-700 shadow-sm' : ''}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-surface-700 shadow-sm' : ''}`}><List className="h-4 w-4" /></button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-surface-900 dark:text-white">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="lg:hidden p-1"><X className="h-4 w-4" /></button>
              </div>
              <SearchFiltersForm onApply={(f) => { fetchListings(f); setShowFilters(false); }} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <ListingGrid listings={listings} loading={loading} columns={viewMode === 'grid' ? 3 : 2} />
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
