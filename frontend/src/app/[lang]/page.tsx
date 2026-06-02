'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingGrid } from '@/components/listings/listing-grid';
import { SearchInput } from '@/components/ui/search-input';
import { listingsApi } from '@/lib/api';
import { Listing, Category } from '@/types';
import {
  Search, Shield, Zap, Truck, Star, ChevronRight, ArrowRight, Users, Package, ShoppingCart, Globe, Mail, Check,
  Laptop, Smartphone, Headphones, Camera, Watch, Monitor, Gamepad2,
} from 'lucide-react';

export default function HomePage() {
  const params = useParams();
  const lang = params.lang as string;
  const t = useTranslations('home');
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadListings = (retries = 2) => {
      listingsApi.getAll({ limit: '8', sortBy: 'createdAt', sortOrder: 'DESC' })
        .then(r => { setFeatured(r.data.results || r.data); setLoading(false) })
        .catch(() => { if (retries > 0) setTimeout(() => loadListings(retries - 1), 3000); else setLoading(false) });
    };
    listingsApi.getCategories()
      .then(r => setCategories(r.data.results || r.data))
      .catch(() => {});
    loadListings();
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    smartphones: <Smartphone className="h-8 w-8" />,
    laptops: <Laptop className="h-8 w-8" />,
    headphones: <Headphones className="h-8 w-8" />,
    cameras: <Camera className="h-8 w-8" />,
    watches: <Watch className="h-8 w-8" />,
    monitors: <Monitor className="h-8 w-8" />,
    gaming: <Gamepad2 className="h-8 w-8" />,
  };

  const steps = [
    { icon: Search, title: t('step1_title'), desc: t('step1_desc') },
    { icon: Shield, title: t('step2_title'), desc: t('step2_desc') },
    { icon: Zap, title: t('step3_title'), desc: t('step3_desc') },
    { icon: Truck, title: t('step4_title'), desc: t('step4_desc') },
  ];

  const testimonials = [
    { name: 'Ahmed K.', role: 'Buyer', content: 'Found a great deal on a MacBook. The AI verification gave me confidence to purchase from a new seller.', rating: 5 },
    { name: 'Sarah M.', role: 'Seller', content: 'The escrow system is amazing. I get paid instantly once the buyer confirms receipt.', rating: 5 },
    { name: 'John D.', role: 'Buyer', content: 'Been using Electronix for months. Never had any issues. Highly recommended for electronics.', rating: 5 },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero */}
        <section className="gradient-hero text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="max-w-3xl">
              <Badge variant="primary" size="lg" className="mb-4 bg-white/10 text-white border-white/20">
                <Zap className="h-3.5 w-3.5" /> AI-Powered Fraud Protection
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                {t('hero_title')}
              </h1>
              <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput onSearch={(q) => window.location.href = `/${lang}/search?q=${encodeURIComponent(q)}`} className="max-w-md" placeholder="Search iPhones, MacBooks, PS5..." />
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href={`/${lang}/listings`}>
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                    {t('hero_cta')} <ArrowRight className="h-4 w-4 rtl-flip" />
                  </Button>
                </Link>
                <Link href={`/${lang}/register`}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    {t('hero_cta_seller')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500" />
        </section>

        {/* Trust badges */}
        <section className="py-6 bg-surface-50 dark:bg-surface-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-surface-500">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> Escrow Protection</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary-500" /> AI Verification</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Trusted Sellers</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary-500" /> Global Shipping</div>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">{t('featured_title')}</h2>
                <p className="section-subtitle">Hand-picked electronics for you</p>
              </div>
              <Link href={`/${lang}/listings`} className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                View All <ChevronRight className="h-4 w-4 rtl-flip" />
              </Link>
            </div>
            <ListingGrid listings={featured} loading={loading} columns={4} />
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 sm:py-16 bg-surface-50 dark:bg-surface-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="section-title">{t('categories_title')}</h2>
              <p className="section-subtitle">Find exactly what you need</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {(categories.length ? categories : [
                { id: '1', name: 'Smartphones', slug: 'smartphones', listings_count: 1234 },
                { id: '2', name: 'Laptops', slug: 'laptops', listings_count: 856 },
                { id: '3', name: 'Headphones', slug: 'headphones', listings_count: 567 },
                { id: '4', name: 'Cameras', slug: 'cameras', listings_count: 432 },
                { id: '5', name: 'Watches', slug: 'watches', listings_count: 321 },
                { id: '6', name: 'Monitors', slug: 'monitors', listings_count: 234 },
                { id: '7', name: 'Gaming', slug: 'gaming', listings_count: 789 },
              ] as Category[]).map((cat) => (
                <Link key={cat.id} href={`/${lang}/categories/${cat.id}`}>
                  <Card className="text-center py-6 card-hover cursor-pointer" padding="md">
                    <div className="mx-auto mb-3 text-primary-600 dark:text-primary-400">
                      {categoryIcons[cat.slug] || <Package className="h-8 w-8" />}
                    </div>
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-surface-500 mt-1">{cat.listings_count?.toLocaleString()} items</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">{t('how_it_works')}</h2>
              <p className="section-subtitle">Four simple steps to your next device</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, idx) => (
                <div key={idx} className="text-center relative">
                  <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="absolute -top-2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-surface-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-12 sm:py-16 gradient-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { icon: Users, label: t('stats_users'), value: '50K+' },
                { icon: Package, label: t('stats_listings'), value: '100K+' },
                { icon: ShoppingCart, label: t('stats_transactions'), value: '$10M+' },
                { icon: Globe, label: t('stats_countries'), value: '120+' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <stat.icon className="h-8 w-8 mx-auto mb-3 opacity-80" />
                  <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-primary-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="section-title">{t('testimonials_title')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <Card key={idx} className="text-center" padding="lg">
                  <div className="flex justify-center mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning-400 text-warning-400" />
                    ))}
                  </div>
                  <p className="text-surface-600 dark:text-surface-300 mb-4 italic">"{t.content}"</p>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white">{t.name}</p>
                    <p className="text-sm text-surface-500">{t.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-surface-50 dark:bg-surface-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="section-title mb-4">Ready to start buying & selling?</h2>
            <p className="section-subtitle mb-8 max-w-xl mx-auto">Join thousands of trusted buyers and sellers on the safest electronics marketplace.</p>
            <div className="flex justify-center gap-3">
              <Link href={`/${lang}/register`}><Button size="lg">Get Started Free</Button></Link>
              <Link href={`/${lang}/listings`}><Button size="lg" variant="outline">Browse Listings</Button></Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-gradient-to-r from-primary-600 to-primary-500 text-white border-none" padding="lg">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{t('newsletter_title')} ✉️</h3>
                  <p className="text-primary-100 text-sm">{t('newsletter_desc')}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                  <Button variant="primary" className="bg-white text-primary-700 hover:bg-primary-50 shrink-0">
                    {t('newsletter_cta')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
