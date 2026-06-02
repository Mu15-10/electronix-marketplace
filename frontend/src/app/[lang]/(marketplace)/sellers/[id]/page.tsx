'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListingGrid } from '@/components/listings/listing-grid';
import { ListingCard } from '@/components/listings/listing-card';
import { usersApi, listingsApi } from '@/lib/api';
import { User, Listing } from '@/types';
import { Verified, Calendar, Package, Star, MessageSquare, Shield } from 'lucide-react';

export default function SellerProfilePage() {
  const params = useParams();
  const lang = params.lang as string;
  const [seller, setSeller] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.getSellerInfo(params.id as string).then(r => setSeller(r.data)),
      listingsApi.getAll({ seller: params.id as string }).then(r => setListings(r.data.results || r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card padding="lg" className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar src={seller?.avatar} name={seller?.full_name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{seller?.full_name || 'Seller'}</h1>
                {seller?.is_verified && <Verified className="h-5 w-5 text-primary-500" />}
                {seller?.seller_level && <Badge variant="primary">Level {seller.seller_level}</Badge>}
              </div>
              <p className="text-surface-500 mb-2">@{seller?.username}</p>
              <div className="flex items-center gap-4 text-sm text-surface-500">
                {seller?.seller_rating && <Rating value={seller.seller_rating} size="sm" readOnly showValue />}
                <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {seller?.total_sales || 0} sales</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {seller?.created_at ? new Date(seller.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button><MessageSquare className="h-4 w-4" /> Contact</Button>
            </div>
          </div>
        </Card>

        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Listings by {seller?.full_name || 'Seller'}</h2>
        <ListingGrid listings={listings} loading={loading} />
      </main>
      <Footer />
    </div>
  );
}
