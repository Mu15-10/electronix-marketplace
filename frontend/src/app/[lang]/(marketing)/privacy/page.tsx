'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPage() {
  const params = useParams();
  const lang = params.lang as string;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-surface-600 dark:text-surface-300">
          <p>Last updated: January 2024</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, including name, email, phone number, and shipping address. We also collect device information and listing details.</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">2. How We Use Your Data</h2>
          <p>Your data is used to facilitate transactions, verify listings, prevent fraud, improve our services, and communicate with you about your account and transactions.</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">3. Data Protection</h2>
          <p>We implement industry-standard encryption, secure servers, and strict access controls to protect your personal information. We never share your data with third parties without your consent.</p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">4. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time through your account settings. Contact us for any privacy-related requests.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
