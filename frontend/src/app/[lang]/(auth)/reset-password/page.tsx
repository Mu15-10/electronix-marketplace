'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const { resetPassword } = useAuth();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    setLoading(true);
    const result = await resetPassword(token, password);
    if (result.success) setDone(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Set new password</h1>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium mb-4">Password reset successfully!</p>
                <a href={`/${lang}/login`}><Button>Go to login</Button></a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input label="New Password" type={show ? 'text' : 'password'} icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 end-0 top-6 pe-3 text-surface-400"><EyeOff className="h-4 w-4" /></button>
                </div>
                <Input label="Confirm Password" type="password" icon={<Lock className="h-4 w-4" />} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                <Button type="submit" loading={loading} className="w-full" size="lg">Reset Password</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
