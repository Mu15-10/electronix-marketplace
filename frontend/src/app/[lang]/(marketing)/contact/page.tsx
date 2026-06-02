'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, MapPin, Phone, Send } from 'lucide-react';

export default function ContactPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Contact Us</h1>
        <p className="text-surface-500 mb-10">We're here to help with any questions or concerns</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card padding="lg">
              {sent ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-sm text-surface-500">We'll get back to you within 24 hours.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>Send Another</Button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name" required />
                    <Input label="Last Name" required />
                  </div>
                  <Input label="Email" type="email" required />
                  <Input label="Subject" required />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Message</label>
                    <textarea className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white min-h-[150px]" rows={5} required />
                  </div>
                  <Button type="submit" className="w-full"><Send className="h-4 w-4" /> Send Message</Button>
                </form>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', value: 'support@electronix.com' },
              { icon: MessageSquare, title: 'Live Chat', value: 'Available 24/7' },
              { icon: MapPin, title: 'Location', value: 'Istanbul, Turkey' },
              { icon: Phone, title: 'Phone', value: '+90 (212) 555 0123' },
            ].map((c, i) => (
              <Card key={i} padding="md" className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <c.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{c.title}</p>
                  <p className="text-xs text-surface-500">{c.value}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
