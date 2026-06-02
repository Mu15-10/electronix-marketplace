'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ListingGrid } from '@/components/listings/listing-grid';
import { listingsApi } from '@/lib/api';
import { Listing, Category } from '@/types';

export default function CategoryDetailPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [listings, setListings] = useState<Listing[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listingsApi.getCategoryListings(params.id as string).then(r => setListings(r.data.results || r.data)),
      listingsApi.getCategories().then(r => {
        const cats = r.data.results || r.data;
        setCategory(cats.find((c: Category) => c.id === params.id) || null);
      }),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">{category?.name || 'Category'}</h1>
        <p className="text-surface-500 mb-8">{listings.length} items available</p>
        <ListingGrid listings={listings} loading={loading} />
      </main>
      <Footer />
    </div>
  );
}
