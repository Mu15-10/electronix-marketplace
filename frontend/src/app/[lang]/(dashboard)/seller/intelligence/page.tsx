'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { PageSpinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';
import { marketIntelligenceApi } from '@/lib/api';
import { MarketIntelligence, DemandTrend, PriceTrend, TrendingBrand, RegionalTrend, TopSearch, CategoryPerformance, SellerInsight } from '@/types';
import { BarChart3, TrendingUp, TrendingDown, Minus, Smartphone, DollarSign, MapPin, Search, Package, Lightbulb, ArrowUp, ArrowDown, Gauge, AlertTriangle, CheckCircle } from 'lucide-react';

const periodOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const mockData: MarketIntelligence = {
  demand_trends: [
    { brand: 'Apple', model: 'iPhone 15 Pro', demand_score: 92, trend: 'up' },
    { brand: 'Samsung', model: 'Galaxy S24', demand_score: 85, trend: 'up' },
    { brand: 'Google', model: 'Pixel 8', demand_score: 72, trend: 'stable' },
    { brand: 'Apple', model: 'MacBook Air M3', demand_score: 68, trend: 'up' },
    { brand: 'Samsung', model: 'Galaxy Tab S9', demand_score: 55, trend: 'down' },
  ],
  price_trends: [
    { date: '2026-01', average_price: 720, median_price: 699 },
    { date: '2026-02', average_price: 715, median_price: 689 },
    { date: '2026-03', average_price: 730, median_price: 699 },
    { date: '2026-04', average_price: 745, median_price: 710 },
    { date: '2026-05', average_price: 760, median_price: 725 },
    { date: '2026-06', average_price: 775, median_price: 739 },
  ],
  trending_brands: [
    { brand: 'Apple', growth_rate: 24, listing_count: 4520 },
    { brand: 'Samsung', growth_rate: 18, listing_count: 3890 },
    { brand: 'Google', growth_rate: 15, listing_count: 1240 },
    { brand: 'Xiaomi', growth_rate: 12, listing_count: 980 },
    { brand: 'OnePlus', growth_rate: 8, listing_count: 670 },
  ],
  regional_trends: [
    { region: 'United States', demand_score: 95, listing_count: 12500 },
    { region: 'United Kingdom', demand_score: 78, listing_count: 5600 },
    { region: 'Germany', demand_score: 72, listing_count: 4300 },
    { region: 'Canada', demand_score: 65, listing_count: 3200 },
    { region: 'Australia', demand_score: 60, listing_count: 2800 },
  ],
  top_searches: [
    { query: 'iPhone 16 Pro', count: 15200, trend: 'up' },
    { query: 'Samsung Galaxy S25', count: 12300, trend: 'up' },
    { query: 'MacBook Air M4', count: 9800, trend: 'up' },
    { query: 'AirPods Pro 3', count: 7600, trend: 'stable' },
    { query: 'iPad Mini 7', count: 5400, trend: 'down' },
  ],
  category_performance: [
    { category: 'Smartphones', listings_count: 15600, avg_price: 645, total_views: 890000 },
    { category: 'Laptops', listings_count: 8900, avg_price: 1200, total_views: 520000 },
    { category: 'Tablets', listings_count: 4200, avg_price: 550, total_views: 310000 },
    { category: 'Wearables', listings_count: 3800, avg_price: 320, total_views: 280000 },
    { category: 'Audio', listings_count: 3100, avg_price: 180, total_views: 240000 },
  ],
  seller_insights: [
    { type: 'recommendation', message: 'Smartphones in the $600-$800 range are selling 40% faster this month.', priority: 'high' },
    { type: 'tip', message: 'Apple devices with original boxes sell for 12% more on average.', priority: 'medium' },
    { type: 'alert', message: 'Samsung Galaxy S24 prices dropped 5% this week - consider adjusting your pricing.', priority: 'high' },
    { type: 'recommendation', message: 'Listings with 5+ images get 3x more views than those with fewer.', priority: 'medium' },
  ],
};

export default function MarketIntelligencePage() {
  const params = useParams();
  const lang = params.lang as string;
  const [data, setData] = useState<MarketIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    marketIntelligenceApi.getData({ period })
      .then((res) => setData(res.data))
      .catch(() => setData(mockData))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <PageSpinner />;
  if (!data) return <EmptyState title="No market intelligence data available" />;

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-danger-500" />;
    return <Minus className="h-4 w-4 text-surface-400" />;
  };

  const insightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="h-5 w-5 text-primary-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'tip': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Lightbulb className="h-5 w-5 text-primary-500" />;
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'border-l-danger-500';
      case 'medium': return 'border-l-warning-500';
      case 'low': return 'border-l-primary-500';
      default: return 'border-l-surface-400';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Market Intelligence</h1>
          <p className="text-sm text-surface-500">Data-driven insights for your business</p>
        </div>
        <div className="flex gap-2">
          {periodOptions.map((opt) => (
            <Button key={opt.value} variant={period === opt.value ? 'primary' : 'secondary'} size="sm" onClick={() => setPeriod(opt.value)}>
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card padding="md" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Demand Trends</h3>
              <Smartphone className="h-5 w-5 text-surface-400" />
            </div>
          </CardHeader>
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {data.demand_trends.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{item.brand}</span>
                    <Badge variant="default" size="sm">{item.model}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Gauge className="h-4 w-4 text-primary-500" />
                    <span className="text-sm font-semibold text-surface-900 dark:text-white">{item.demand_score}</span>
                  </div>
                  {renderTrendIcon(item.trend)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Seller Insights</h3>
              <Lightbulb className="h-5 w-5 text-surface-400" />
            </div>
          </CardHeader>
          <div className="space-y-3">
            {data.seller_insights.map((insight, i) => (
              <div key={i} className={`border-l-4 ${priorityColor(insight.priority)} pl-3 py-2`}>
                <div className="flex items-center gap-2 mb-1">
                  {insightIcon(insight.type)}
                  <Badge variant={insight.type === 'recommendation' ? 'primary' : insight.type === 'alert' ? 'warning' : 'success'} size="sm">
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-300">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Price Trends</h3>
              <DollarSign className="h-5 w-5 text-surface-400" />
            </div>
          </CardHeader>
          <div className="flex items-end gap-2 h-40">
            {data.price_trends.map((item, i) => {
              const maxPrice = Math.max(...data.price_trends.map((p) => p.average_price));
              const height = (item.average_price / maxPrice) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-t-md relative" style={{ height: `${height}%` }}>
                    <div className="absolute bottom-0 w-full bg-primary-500 rounded-t-md" style={{ height: '100%' }} />
                  </div>
                  <span className="text-xs text-surface-400">{formatPrice(item.average_price)}</span>
                  <span className="text-xs text-surface-400">{item.date.split('-')[1]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Trending Brands</h3>
              <TrendingUp className="h-5 w-5 text-surface-400" />
            </div>
          </CardHeader>
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {data.trending_brands.map((brand, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-surface-900 dark:text-white w-24">{brand.brand}</span>
                  <span className="text-xs text-surface-400">{brand.listing_count.toLocaleString()} listings</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-600">+{brand.growth_rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Regional Trends</h3>
              <MapPin className="h-5 w-5 text-surface-400" />
            </div>
          </CardHeader>
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {data.regional_trends.map((region, i) => (
              <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{region.region}</p>
                  <p className="text-xs text-surface-400">{region.listing_count.toLocaleString()} listings</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${region.demand_score}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-surface-900 dark:text-white w-8 text-end">{region.demand_score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Top Searches</h3>
              <Search className="h-5 w-5 text-surface-400" />
            </div>
          </CardHeader>
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {data.top_searches.map((search, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{search.query}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-surface-500">{search.count.toLocaleString()}</span>
                  {renderTrendIcon(search.trend)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padding="md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-surface-900 dark:text-white">Category Performance</h3>
            <Package className="h-5 w-5 text-surface-400" />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-700">
                <th className="text-start py-3 px-2 font-medium text-surface-500">Category</th>
                <th className="text-end py-3 px-2 font-medium text-surface-500">Listings</th>
                <th className="text-end py-3 px-2 font-medium text-surface-500">Avg Price</th>
                <th className="text-end py-3 px-2 font-medium text-surface-500">Total Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {data.category_performance.map((cat, i) => (
                <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-2 font-medium text-surface-900 dark:text-white">{cat.category}</td>
                  <td className="text-end py-3 px-2 text-surface-600 dark:text-surface-300">{cat.listings_count.toLocaleString()}</td>
                  <td className="text-end py-3 px-2 text-surface-600 dark:text-surface-300">{formatPrice(cat.avg_price)}</td>
                  <td className="text-end py-3 px-2 text-surface-600 dark:text-surface-300">{cat.total_views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
