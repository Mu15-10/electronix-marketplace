'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { listingsApi } from '@/lib/api';
import { Category } from '@/types';
import { Package, Smartphone, Laptop, Headphones, Camera, Watch, Monitor, Gamepad2 } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  smartphones: <Smartphone className="h-10 w-10" />,
  laptops: <Laptop className="h-10 w-10" />,
  headphones: <Headphones className="h-10 w-10" />,
  cameras: <Camera className="h-10 w-10" />,
  watches: <Watch className="h-10 w-10" />,
  monitors: <Monitor className="h-10 w-10" />,
  gaming: <Gamepad2 className="h-10 w-10" />,
};

export default function CategoriesPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getCategories()
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Categories</h1>
        <p className="text-surface-500 mb-8">Browse electronics by category</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(categories.length ? categories : []).map((cat) => (
            <Link key={cat.id} href={`/${lang}/categories/${cat.id}`}>
              <Card className="text-center py-8 card-hover cursor-pointer" padding="lg">
                <div className="mx-auto mb-4 text-primary-600 dark:text-primary-400">
                  {iconMap[cat.slug] || <Package className="h-10 w-10" />}
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-1">{cat.name}</h3>
                <p className="text-sm text-surface-500">{cat.listings_count?.toLocaleString() || 0} items</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
