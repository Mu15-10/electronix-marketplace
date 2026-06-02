'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SellerCard } from '@/components/seller/seller-card';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';

const mockSellers = [
  { id: '1', full_name: 'TechStore', username: 'techstore', is_verified: true, seller_level: 5, seller_rating: 4.9, total_sales: 1234, created_at: '2023-01-15', avatar: '' },
  { id: '2', full_name: 'GadgetHub', username: 'gadgethub', is_verified: true, seller_level: 4, seller_rating: 4.7, total_sales: 856, created_at: '2023-03-20', avatar: '' },
  { id: '3', full_name: 'PhoneKing', username: 'phoneking', is_verified: false, seller_level: 3, seller_rating: 4.5, total_sales: 567, created_at: '2023-06-10', avatar: '' },
];

export default function SellersPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [search, setSearch] = useState('');

  const filtered = mockSellers.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Top Sellers</h1>
        <p className="text-surface-500 mb-6">Find trusted sellers on Electronix</p>

        <div className="mb-6 max-w-md">
          <Input placeholder="Search sellers..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((seller) => (
            <SellerCard key={seller.id} seller={seller as any} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
