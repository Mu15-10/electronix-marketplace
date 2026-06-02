'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Shield, Zap, Globe, Users, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  const params = useParams();
  const lang = params.lang as string;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="gradient-hero text-white py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">About Electronix</h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">Building the world's safest electronics marketplace with AI-powered verification</p>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To create a trusted marketplace where buying and selling electronics is safe, transparent, and fair for everyone.' },
              { icon: Heart, title: 'Our Values', desc: 'Trust, transparency, and innovation drive everything we do. We put safety first.' },
              { icon: Globe, title: 'Our Vision', desc: 'A world where anyone can buy or sell electronics with complete confidence.' },
            ].map((v, i) => (
              <Card key={i} className="text-center" padding="lg">
                <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-surface-500">{v.desc}</p>
              </Card>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>Our Story</h2>
            <p>Founded in 2024, Electronix was built to solve a critical problem in the electronics resale market: trust. With fake listings, stolen devices, and fraudulent transactions plaguing online marketplaces, we decided to build something better.</p>
            <p>Our AI-powered platform automatically verifies listings, detects fraud, and protects both buyers and sellers with our escrow payment system. Every device listing is analyzed by our machine learning models to ensure authenticity.</p>
            <p>Today, we serve users in over 120 countries, with thousands of verified listings and millions in safe transactions.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
