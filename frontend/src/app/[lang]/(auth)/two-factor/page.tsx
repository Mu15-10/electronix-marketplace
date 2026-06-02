'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TwoFactorForm } from '@/components/auth/two-factor-form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function TwoFactorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const { twoFactor } = useAuth();
  const [loading, setLoading] = useState(false);
  const tempToken = searchParams.get('token') || '';

  const handleSubmit = async (code: string) => {
    setLoading(true);
    await twoFactor(code, tempToken);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Two-Factor Authentication</h1>
            <p className="text-sm text-surface-500 mt-1">Enter the code from your authenticator app</p>
          </CardHeader>
          <CardContent>
            <TwoFactorForm onSubmit={handleSubmit} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
