'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, User, Phone, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

const step1Schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Need uppercase').regex(/[0-9]/, 'Need number'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, { message: 'Passwords must match', path: ['confirm_password'] });

const step2Schema = z.object({
  full_name: z.string().min(2, 'Required'),
  username: z.string().min(3, 'Min 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Required'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'tr', label: 'Turkey' },
  { value: 'ae', label: 'UAE' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'de', label: 'Germany' },
];

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2 = async (data: Step2Data) => {
    setIsLoading(true);
    await registerUser({ ...step1Data, ...data });
    setIsLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-2 rounded-full bg-surface-200 dark:bg-surface-700">
              <div className={`h-full rounded-full transition-all ${s <= step ? 'bg-primary-600' : ''}`} style={{ width: s <= step ? '100%' : '0%' }} />
            </div>
          ))}
        </div>
        <p className="text-sm text-surface-500 text-center">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
          <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} error={step1Form.formState.errors.email?.message} {...step1Form.register('email')} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} icon={<Lock className="h-4 w-4" />} error={step1Form.formState.errors.password?.message} {...step1Form.register('password')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 end-0 top-6 flex items-center pe-3 text-surface-400"><EyeOff className="h-4 w-4" /></button>
          </div>
          <Input label="Confirm Password" type="password" icon={<Lock className="h-4 w-4" />} error={step1Form.formState.errors.confirm_password?.message} {...step1Form.register('confirm_password')} />
          <Button type="submit" className="w-full" size="lg">
            Continue <ChevronRight className="h-4 w-4 rtl-flip" />
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
          <Input label="Full Name" icon={<User className="h-4 w-4" />} error={step2Form.formState.errors.full_name?.message} {...step2Form.register('full_name')} />
          <Input label="Username" icon={<User className="h-4 w-4" />} error={step2Form.formState.errors.username?.message} {...step2Form.register('username')} helperText="Only letters, numbers, and underscores" />
          <Input label="Phone (optional)" type="tel" icon={<Phone className="h-4 w-4" />} {...step2Form.register('phone')} />
          <Select label="Country" options={countries} placeholder="Select country" error={step2Form.formState.errors.country?.message} {...step2Form.register('country')} />
          <Checkbox label="I agree to the Terms of Service and Privacy Policy" />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ChevronLeft className="h-4 w-4 rtl-flip" /> Back
            </Button>
            <Button type="submit" loading={isLoading} className="flex-1">
              Create Account
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-8">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Verify Your Email</h3>
          <p className="text-sm text-surface-500 mb-6">We sent a verification link to your email.</p>
          <Button variant="outline">Resend Email</Button>
        </div>
      )}
    </div>
  );
}
