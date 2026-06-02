'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const faqs = [
  { q: 'How does the escrow system work?', a: 'When you buy an item, payment is held securely in escrow. The seller ships the item, and once you confirm receipt and satisfaction, the funds are released to the seller. This protects both parties.' },
  { q: 'What is AI-powered verification?', a: 'Our AI analyzes listing photos, descriptions, and device information to detect potential fraud, verify authenticity, and ensure accurate categorization. This helps maintain a trusted marketplace.' },
  { q: 'How do I become a seller?', a: 'Simply create an account and verify your identity. You can start listing items immediately. Higher verification levels unlock additional features and increase buyer trust.' },
  { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards, PayPal, bank transfers, and major cryptocurrencies. All payments are processed securely through our platform.' },
  { q: 'How long does shipping take?', a: 'Shipping times vary by seller location and method. Most domestic orders arrive within 3-7 business days. International shipping may take 7-14 business days.' },
  { q: 'Can I return an item?', a: 'Returns are handled between buyers and sellers. Our dispute resolution team can help if you receive an item that significantly differs from its description.' },
  { q: 'What is IMEI verification?', a: 'IMEI (International Mobile Equipment Identity) verification checks if a device is reported lost, stolen, or blacklisted. This protects buyers from purchasing stolen devices.' },
  { q: 'How are disputes resolved?', a: 'If a dispute arises, both parties submit evidence. Our team reviews chat logs, photos, shipping information, and other relevant data to make a fair decision.' },
];

export default function FAQPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-surface-500 mb-8">Find answers to common questions about Electronix</p>

        <div className="mb-8">
          <Input placeholder="Search FAQs..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3">
          {filtered.map((faq, idx) => (
            <Card key={idx} padding="none">
              <button
                onClick={() => setOpenId(openId === idx ? null : idx)}
                className="flex items-center justify-between w-full p-4 text-start"
              >
                <span className="text-sm font-medium text-surface-900 dark:text-white">{faq.q}</span>
                <ChevronDown className={cn('h-5 w-5 text-surface-400 transition-transform shrink-0', openId === idx && 'rotate-180')} />
              </button>
              {openId === idx && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-surface-600 dark:text-surface-300">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
