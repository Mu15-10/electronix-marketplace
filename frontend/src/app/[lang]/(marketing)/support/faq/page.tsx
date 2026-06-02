'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { id: '1', question: 'How do I create a support ticket?', answer: 'Go to your dashboard, click Support, then click Create Ticket. Fill in the subject, description, and category, then submit. Our team will respond within 24 hours.', category: 'account' },
  { id: '2', question: 'What is the response time for support tickets?', answer: 'We aim to respond to all tickets within 24 hours. Urgent tickets are prioritized and typically receive a response within 4 hours.', category: 'account' },
  { id: '3', question: 'How does the escrow payment system work?', answer: 'When you buy an item, payment is held securely in escrow. The seller ships the item, and once you confirm receipt, the funds are released. This protects both parties.', category: 'payment' },
  { id: '4', question: 'What payment methods are accepted?', answer: 'We accept credit/debit cards, PayPal, bank transfers, and major cryptocurrencies. All payments are processed securely through our platform.', category: 'payment' },
  { id: '5', question: 'Why is my payment still pending?', answer: 'Payments may be pending due to bank processing times, fraud checks, or technical issues. If it persists beyond 24 hours, please contact support.', category: 'payment' },
  { id: '6', question: 'How do I verify my identity?', answer: 'Go to Settings > Verification and upload a valid ID card, passport, or driver\'s license. Our team reviews documents within 48 hours.', category: 'verification' },
  { id: '7', question: 'Why was my verification rejected?', answer: 'Common reasons include blurry images, expired documents, or mismatched information. You can re-submit with clearer documents.', category: 'verification' },
  { id: '8', question: 'How long does shipping take?', answer: 'Domestic orders typically arrive within 3-7 business days. International shipping may take 7-14 business days depending on the destination.', category: 'shipping' },
  { id: '9', question: 'What should I do if my item doesn\'t arrive?', answer: 'First contact the seller through chat. If unresolved, open a dispute within 14 days of the estimated delivery date.', category: 'shipping' },
  { id: '10', question: 'How do I report a fraudulent listing?', answer: 'Click the "Report" button on any listing. Our fraud detection team investigates all reports within 24 hours.', category: 'fraud' },
  { id: '11', question: 'What is IMEI verification?', answer: 'IMEI verification checks if a device is reported lost, stolen, or blacklisted. This protects buyers from purchasing stolen devices.', category: 'fraud' },
  { id: '12', question: 'How do I change my password?', answer: 'Go to Settings > Security and click "Change Password". You\'ll need your current password to set a new one.', category: 'account' },
  { id: '13', question: 'Can I delete my account?', answer: 'Yes, go to Settings > Account and click "Delete Account". This action is irreversible and all your data will be permanently removed.', category: 'account' },
  { id: '14', question: 'My device was damaged during shipping', answer: 'Please take photos of the damage and contact the seller immediately. If the seller is unresponsive, open a dispute with the evidence attached.', category: 'shipping' },
  { id: '15', question: 'How do I become a seller?', answer: 'Create an account and verify your identity. You can start listing items immediately. Higher verification levels unlock additional features.', category: 'account' },
];

const categories = [
  { value: 'all', label: 'All' },
  { value: 'account', label: 'Account' },
  { value: 'payment', label: 'Payment' },
  { value: 'verification', label: 'Verification' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'fraud', label: 'Fraud' },
];

export default function SupportFAQPage() {
  const t = useTranslations('support');
  const params = useParams();
  const lang = params.lang as string;
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <HelpCircle className="h-12 w-12 mx-auto text-primary-600 mb-4" />
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('faqTitle')}</h1>
          <p className="text-surface-500">{t('faqSubtitle')}</p>
        </div>

        <div className="mb-8">
          <Input
            placeholder={t('searchFaq')}
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" onChange={setActiveCategory}>
          <TabList className="mb-6">
            {categories.map((cat) => (
              <Tab key={cat.value} value={cat.value}>{cat.label}</Tab>
            ))}
          </TabList>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-surface-400">{t('noResults')}</p>
              </div>
            ) : (
              filtered.map((faq) => (
                <Card key={faq.id} padding="none">
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="flex items-center justify-between w-full p-4 text-start"
                  >
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{faq.question}</span>
                    <ChevronDown className={cn('h-5 w-5 text-surface-400 transition-transform shrink-0', openId === faq.id && 'rotate-180')} />
                  </button>
                  {openId === faq.id && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-surface-600 dark:text-surface-300">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
