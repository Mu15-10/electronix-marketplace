'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const params = useParams();
  const lang = params.lang as string;
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md">
        <Link href={`/${lang}`} className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-surface-900 dark:text-white">Electronix</span>
        </Link>

        <Card padding="lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reset password</h1>
            <p className="text-sm text-surface-500 mt-1">
              {sent ? 'Check your email for a reset link' : "Enter your email and we'll send you a reset link"}
            </p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-surface-500 mb-4">Email sent to {email}</p>
                <Button variant="outline" onClick={() => setSent(false)}>Send again</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Link</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href={`/${lang}/login`} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="h-4 w-4 rtl-flip" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
