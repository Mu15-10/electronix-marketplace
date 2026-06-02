'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const params = useParams();
  const lang = params.lang as string;

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
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-surface-500 mt-1">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-surface-500 mt-6">
          Don't have an account?{' '}
          <Link href={`/${lang}/register`} className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
