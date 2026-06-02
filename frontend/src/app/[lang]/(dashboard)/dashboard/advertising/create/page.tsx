'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { advertisingApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const campaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().max(500).optional(),
  budget: z.number().min(1, 'Budget is required'),
  daily_budget: z.number().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  targeting_locations: z.string().optional(),
  targeting_devices: z.string().optional(),
  targeting_categories: z.string().optional(),
});

const locationOptions = [
  { value: 'ALL', label: 'All Locations' },
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'Europe' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'TR', label: 'Turkey' },
  { value: 'AE', label: 'UAE' },
];

const deviceOptions = [
  { value: 'all', label: 'All Devices' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'desktop', label: 'Desktop' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'cameras', label: 'Cameras' },
  { value: 'watches', label: 'Watches' },
  { value: 'gaming', label: 'Gaming' },
];

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function CreateCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema) as any,
  });

  const onSubmit = async (data: CampaignFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        budget: data.budget,
        daily_budget: data.daily_budget || undefined,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        targeting: {
          locations: data.targeting_locations && data.targeting_locations !== 'ALL' ? [data.targeting_locations] : [],
          devices: data.targeting_devices && data.targeting_devices !== 'all' ? [data.targeting_devices] : [],
          categories: data.targeting_categories && data.targeting_categories !== 'all' ? [data.targeting_categories] : [],
        },
      };
      await advertisingApi.createCampaign(payload);
      toast.success('Campaign created successfully!');
      router.push(`/${lang}/dashboard/advertising`);
    } catch {
      toast.error('Failed to create campaign');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create Campaign</h1>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex-1">
            <div className={`h-2 rounded-full ${s <= step ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'}`} />
            <p className="text-xs text-surface-500 mt-1">{s === 1 ? 'Campaign Details' : 'Targeting & Budget'}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <Card padding="lg" className="space-y-4">
            <Input label="Campaign Name" placeholder="e.g. Summer Sale 2026" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description (optional)" placeholder="Describe your campaign goals..." {...register('description')} />
            <Input label="Start Date" type="date" error={errors.start_date?.message} {...register('start_date')} />
            <Input label="End Date (optional)" type="date" {...register('end_date')} helperText="Leave empty for ongoing campaign" />
            <Button type="button" onClick={() => setStep(2)} className="w-full">Next: Targeting & Budget <ChevronRight className="h-4 w-4 rtl-flip" /></Button>
          </Card>
        )}

        {step === 2 && (
          <Card padding="lg" className="space-y-4">
            <Input label="Total Budget" type="number" placeholder="1000" error={errors.budget?.message} {...register('budget', { valueAsNumber: true })} />
            <Input label="Daily Budget (optional)" type="number" placeholder="100" {...register('daily_budget', { valueAsNumber: true })} helperText="Limits daily spend" />

            <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Targeting</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select label="Locations" options={locationOptions} {...register('targeting_locations')} />
                <Select label="Devices" options={deviceOptions} {...register('targeting_devices')} />
                <Select label="Categories" options={categoryOptions} {...register('targeting_categories')} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1"><ChevronLeft className="h-4 w-4 rtl-flip" /> Back</Button>
              <Button type="submit" loading={submitting} className="flex-1">Create Campaign</Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
