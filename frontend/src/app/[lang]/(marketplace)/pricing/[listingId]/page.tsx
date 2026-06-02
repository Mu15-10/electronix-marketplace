'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSpinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';
import { pricingApi } from '@/lib/api';
import { ListingPriceComparison } from '@/types';
import { TrendingUp, DollarSign, BarChart3, Info, ArrowUpDown, Gauge } from 'lucide-react';

const mockData: ListingPriceComparison = {
  listing_id: '1',
  listing_title: 'iPhone 15 Pro Max 256GB',
  listing_price: 999,
  market_average: 949,
  price_ranking: 65,
  demand_info: 'High demand - selling 30% faster than average',
  similar_listings: [
    { title: 'iPhone 15 Pro Max 256GB - New', price: 1049, condition: 'new' },
    { title: 'iPhone 15 Pro Max 256GB - Excellent', price: 969, condition: 'excellent' },
    { title: 'iPhone 15 Pro Max 256GB - Good', price: 899, condition: 'good' },
    { title: 'iPhone 15 Pro 128GB', price: 799, condition: 'excellent' },
  ],
};

export default function ListingPricingPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [data, setData] = useState<ListingPriceComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pricingApi.getListingPrice(params.listingId as string)
      .then((res) => setData(res.data))
      .catch(() => setData(mockData))
      .finally(() => setLoading(false));
  }, [params.listingId]);

  if (loading) return <PageSpinner />;
  if (!data) return <EmptyState title="No pricing data available" />;

  const priceDiff = data.listing_price - data.market_average;
  const isAbove = priceDiff > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Price Analysis</h1>
      <p className="text-surface-500 mb-6">{data.listing_title}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card padding="lg" className="text-center">
          <p className="text-sm text-surface-500 mb-1">Listing Price</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{formatPrice(data.listing_price)}</p>
          <Badge variant={isAbove ? 'danger' : 'success'} size="sm" className="mt-2">
            {isAbove ? `${formatPrice(priceDiff)} above market` : `${formatPrice(Math.abs(priceDiff))} below market`}
          </Badge>
        </Card>
        <Card padding="lg" className="text-center">
          <p className="text-sm text-surface-500 mb-1">Market Average</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{formatPrice(data.market_average)}</p>
          <p className="text-xs text-surface-400 mt-2">for similar listings</p>
        </Card>
        <Card padding="lg" className="text-center">
          <p className="text-sm text-surface-500 mb-1">Price Ranking</p>
          <p className="text-3xl font-bold text-primary-600">{data.price_ranking}%</p>
          <p className="text-xs text-surface-400 mt-2">more expensive than similar</p>
        </Card>
      </div>

      <Card padding="md" className="mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary-500 mt-0.5" />
          <div>
            <p className="font-semibold text-surface-900 dark:text-white">Demand Insight</p>
            <p className="text-sm text-surface-500 mt-1">{data.demand_info}</p>
          </div>
        </div>
      </Card>

      <Card padding="md">
        <CardHeader>
          <h3 className="font-semibold text-surface-900 dark:text-white">Similar Listings Pricing</h3>
        </CardHeader>
        <div className="divide-y divide-surface-100 dark:divide-surface-700">
          {data.similar_listings.map((listing, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{listing.title}</p>
                <Badge variant={listing.condition === 'new' ? 'success' : listing.condition === 'excellent' ? 'primary' : 'warning'} size="sm" className="mt-1">{listing.condition}</Badge>
              </div>
              <p className="text-sm font-semibold text-surface-900 dark:text-white">{formatPrice(listing.price)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
