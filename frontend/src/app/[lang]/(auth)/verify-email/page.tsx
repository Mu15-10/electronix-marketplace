'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [resent, setResent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md text-center">
        <Card padding="lg">
          <CardHeader>
            <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-10 w-10 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Verify your email</h1>
            <p className="text-sm text-surface-500 mt-2">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setResent(true)} className="mb-2">
              {resent ? 'Email sent!' : 'Resend verification email'}
            </Button>
          </CardContent>
        </Card>

        <Link href={`/${lang}/dashboard`} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-6">
          <ArrowLeft className="h-4 w-4 rtl-flip" /> Go to dashboard
        </Link>
      </div>
    </div>
  );
}
