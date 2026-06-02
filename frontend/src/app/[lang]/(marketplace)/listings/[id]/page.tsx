'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ImageGallery } from '@/components/listings/image-gallery';
import { PriceDisplay } from '@/components/listings/price-display';
import { Button } from '@/components/ui/button';
import { Badge, ConditionBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Rating } from '@/components/ui/rating';
import { Card } from '@/components/ui/card';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { listingsApi } from '@/lib/api';
import { Listing } from '@/types';
import { Heart, Share2, Flag, MapPin, Eye, Calendar, Shield, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    listingsApi.getById(params.id as string)
      .then((res) => setListing(res.data))
      .catch(() => router.push(`/${lang}/listings`))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="min-h-screen"><Header /><div className="flex justify-center py-20"><Spinner size="lg" /></div><Footer /></div>;
  if (!listing) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ImageGallery images={listing.images} />
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">{listing.title}</h1>
                <p className="text-surface-500 mt-1">{listing.brand} {listing.model}{listing.variant ? ` - ${listing.variant}` : ''}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setIsWishlisted(!isWishlisted)} className={`p-2 rounded-lg border ${isWishlisted ? 'text-danger-500 border-danger-200' : 'text-surface-400 border-surface-200 dark:border-surface-600'} hover:bg-surface-50 dark:hover:bg-surface-800`}>
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 rounded-lg border border-surface-200 dark:border-surface-600 text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <ConditionBadge condition={listing.condition} />
              {listing.is_featured && <Badge variant="warning">Featured</Badge>}
              {listing.imei_verified && <Badge variant="success" dot>IMEI Verified</Badge>}
              {listing.ai_confidence && (
                <Badge variant="info" dot>AI Verified ({Math.round(listing.ai_confidence)}%)</Badge>
              )}
            </div>

            <PriceDisplay price={listing.price} originalPrice={listing.original_price} currency={listing.currency} size="lg" className="mb-6" />

            <div className="flex items-center gap-4 text-sm text-surface-500 mb-6">
              <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {listing.location}</div>
              <div className="flex items-center gap-1"><Eye className="h-4 w-4" /> {listing.views_count} views</div>
              <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(listing.created_at).toLocaleDateString()}</div>
            </div>

            <p className="text-surface-600 dark:text-surface-300 mb-6 leading-relaxed">{listing.description}</p>

            {listing.condition !== 'new' && (
              <Card className="mb-6" padding="sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">Pre-owned device</p>
                    <p className="text-xs text-surface-500">This item has been used. Please review condition details carefully.</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-3 mb-6">
              <Button size="lg" className="flex-1">
                <MessageSquare className="h-5 w-5" /> Contact Seller
              </Button>
              <Button size="lg" variant="primary" className="flex-1">
                <Shield className="h-5 w-5" /> Buy Now
              </Button>
            </div>

            {/* Seller info */}
            <Card padding="md" className="flex items-center gap-4">
              <Avatar src={listing.seller?.avatar} name={listing.seller?.full_name} size="lg" online />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-surface-900 dark:text-white">{listing.seller?.full_name}</p>
                  {listing.seller?.is_verified && <CheckCircle className="h-4 w-4 text-primary-500" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  {listing.seller?.seller_rating && <Rating value={listing.seller.seller_rating} size="sm" readOnly />}
                  <span>{listing.seller?.total_sales || 0} sales</span>
                </div>
              </div>
              <Button variant="outline" size="sm">View Profile</Button>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabList>
            <Tab value="details">Details</Tab>
            <Tab value="specs">Specifications</Tab>
            <Tab value="reviews">Reviews</Tab>
            <Tab value="shipping">Shipping</Tab>
          </TabList>
          <TabPanel value="details">
            <p className="text-surface-600 dark:text-surface-300">{listing.description}</p>
          </TabPanel>
          <TabPanel value="specs">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Brand', value: listing.brand },
                { label: 'Model', value: listing.model },
                { label: 'Variant', value: listing.variant || '-' },
                { label: 'Storage', value: listing.storage || '-' },
                { label: 'Color', value: listing.color || '-' },
                { label: 'Year', value: listing.year?.toString() || '-' },
                { label: 'Condition', value: listing.condition },
                { label: 'IMEI Verified', value: listing.imei_verified ? 'Yes' : 'No' },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between py-2 border-b border-surface-100 dark:border-surface-700">
                  <span className="text-sm text-surface-500">{spec.label}</span>
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </TabPanel>
          <TabPanel value="reviews">
            <p className="text-surface-500">Reviews coming soon.</p>
          </TabPanel>
          <TabPanel value="shipping">
            <p className="text-surface-500">Shipping information coming soon.</p>
          </TabPanel>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
