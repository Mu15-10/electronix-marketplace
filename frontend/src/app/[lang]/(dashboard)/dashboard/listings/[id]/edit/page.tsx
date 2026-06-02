'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { listingsApi } from '@/lib/api';
import { Listing } from '@/types';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    listingsApi.getById(params.id as string)
      .then(res => {
        setListing(res.data);
        reset({
          title: res.data.title,
          description: res.data.description,
          price: res.data.price,
          condition: res.data.condition,
          brand: res.data.brand,
          model: res.data.model,
          variant: res.data.variant,
          location: res.data.location,
        });
      })
      .catch(() => router.push(`/${lang}/dashboard/listings`))
      .finally(() => setLoading(false));
  }, [params.id]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, String(v)); });
      await listingsApi.update(params.id as string, formData);
      toast.success('Listing updated!');
      router.push(`/${lang}/dashboard/listings`);
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Edit Listing</h1>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title')} />
          <div className="space-y-1">
            <label className="block text-sm font-medium">Description</label>
            <textarea {...register('description')} className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-surface-900 dark:border-surface-600 dark:bg-surface-800 dark:text-white min-h-[120px]" />
          </div>
          <Input label="Price" type="number" {...register('price', { valueAsNumber: true })} />
          <Select label="Condition" options={[{ value: 'new', label: 'New' }, { value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'damaged', label: 'Damaged' }]} {...register('condition')} />
          <Input label="Brand" {...register('brand')} />
          <Input label="Model" {...register('model')} />
          <Input label="Variant" {...register('variant')} />
          <Input label="Location" {...register('location')} />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
