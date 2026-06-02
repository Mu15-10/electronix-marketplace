'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function TermsPage() {
  const params = useParams();
  const lang = params.lang as string;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-8">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-surface-600 dark:text-surface-300">
          <p>Last updated: January 2024</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>By accessing and using Electronix Marketplace ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">2. User Accounts</h2>
          <p>You must create an account to buy or sell on the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">3. Listings</h2>
          <p>Sellers must provide accurate descriptions of their items. Prohibited items include counterfeit goods, stolen devices, and any items that violate applicable laws.</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">4. Escrow & Payments</h2>
          <p>All transactions are processed through our secure escrow system. Funds are held until the buyer confirms receipt and satisfaction. Our AI-powered fraud detection monitors all transactions.</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">5. Dispute Resolution</h2>
          <p>In case of disputes, our team will review all evidence including chat logs, photos, and shipping information to reach a fair resolution.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
