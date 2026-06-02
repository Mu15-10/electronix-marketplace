'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { auctionsApi } from '@/lib/api';
import { Auction } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { Gavel, Clock, Eye, Users, Filter, X, SlidersHorizontal, TrendingUp, Timer } from 'lucide-react';

export default function AuctionsPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterEndingSoon, setFilterEndingSoon] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page), page_size: '12', sort_by: sortBy,
      };
      if (filterBrand) params.brand = filterBrand;
      if (filterModel) params.model = filterModel;
      if (filterCondition) params.condition = filterCondition;
      if (filterMinPrice) params.min_price = filterMinPrice;
      if (filterMaxPrice) params.max_price = filterMaxPrice;
      if (filterEndingSoon) params.ending_soon = 'true';

      const res = await auctionsApi.getAll(params);
      setAuctions(res.data.results || res.data || []);
      setTotal(res.data.count || 0);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAuctions(); }, [page, sortBy]);

  useEffect(() => {
    if (filterEndingSoon || filterBrand || filterModel || filterCondition || filterMinPrice || filterMaxPrice) {
      fetchAuctions();
    }
  }, [filterEndingSoon, filterBrand, filterModel, filterCondition, filterMinPrice, filterMaxPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated: Record<string, string> = {};
      auctions.forEach((a) => {
        const diff = new Date(a.end_date).getTime() - Date.now();
        if (diff <= 0) { updated[a.id] = 'Ended'; return; }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        updated[a.id] = days > 0 ? `${days}d ${hours}h ${minutes}m ${secs}s` : `${hours}h ${minutes}m ${secs}s`;
      });
      setTimeRemaining(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [auctions]);

  const clearFilters = () => {
    setFilterBrand('');
    setFilterModel('');
    setFilterCondition('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterEndingSoon(false);
    setPage(1);
  };

  const conditionOptions = [
    { value: '', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'ending_soon', label: 'Ending Soon' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Auctions</h1>
            <p className="text-sm text-surface-500">{total} active auctions</p>
          </div>
          <div className="flex items-center gap-2">
            <Select options={sortOptions} value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40" />
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
              <div className="space-y-4">
                <Input label="Brand" placeholder="Apple, Samsung..." value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} />
                <Input label="Model" placeholder="iPhone 15..." value={filterModel} onChange={(e) => setFilterModel(e.target.value)} />
                <Select label="Condition" options={conditionOptions} value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} />
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Price Range</label>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} />
                    <span className="text-surface-400">-</span>
                    <Input placeholder="Max" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filterEndingSoon} onChange={(e) => setFilterEndingSoon(e.target.checked)}
                    className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-surface-700 dark:text-surface-300">Ending soon</span>
                </label>
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full"><Filter className="h-4 w-4" /> Clear Filters</Button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : auctions.length === 0 ? (
              <EmptyState
                icon={<Gavel className="h-16 w-16" />}
                title="No auctions found"
                description="Try adjusting your filters or check back later for new auctions."
                action={clearFilters ? <Button variant="outline" onClick={clearFilters}>Clear Filters</Button> : undefined}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {auctions.map((auction) => (
                    <Link key={auction.id} href={`/${lang}/auctions/${auction.id}`}>
                      <Card hover padding="none" className="overflow-hidden h-full">
                        <div className="aspect-[16/9] bg-surface-100 dark:bg-surface-700 relative overflow-hidden">
                          {auction.listing?.images?.[0] ? (
                            <img src={auction.listing.images[0].url} alt={auction.listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-surface-400"><Gavel className="h-12 w-12" /></div>
                          )}
                          <div className="absolute top-2 start-2">
                            <Badge variant={auction.status === 'active' ? 'success' : 'default'} size="sm" dot>
                              {auction.status === 'active' ? 'Active' : auction.status}
                            </Badge>
                          </div>
                          {auction.reserve_price && !auction.reserve_met && (
                            <div className="absolute top-2 end-2">
                              <Badge variant="warning" size="sm">Reserve not met</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                            {auction.listing?.title || 'Auction'}
                          </h3>
                          <p className="text-xs text-surface-500 mt-0.5">
                            {auction.listing?.brand} {auction.listing?.model}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <p className="text-xs text-surface-500">Current Bid</p>
                              <p className="text-lg font-bold text-primary-600">{formatPrice(auction.current_bid)}</p>
                            </div>
                            <div className="text-end">
                              <p className="text-xs text-surface-500">Time Left</p>
                              <p className={`text-sm font-medium flex items-center gap-1 ${timeRemaining[auction.id] === 'Ended' ? 'text-danger-500' : 'text-surface-900 dark:text-white'}`}>
                                <Timer className="h-3.5 w-3.5" />
                                {timeRemaining[auction.id] || '--'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-700 text-xs text-surface-500">
                            <div className="flex items-center gap-1"><Gavel className="h-3.5 w-3.5" /> {auction.bid_count} bids</div>
                            <div className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {auction.watcher_count} watching</div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
