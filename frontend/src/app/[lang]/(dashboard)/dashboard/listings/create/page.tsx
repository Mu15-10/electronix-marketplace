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
import { listingsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';

const listingSchema = z.object({
  title: z.string().min(5, 'Min 5 characters'),
  description: z.string().min(20, 'Min 20 characters').max(2000),
  price: z.number().min(1, 'Price required'),
  original_price: z.number().optional(),
  currency: z.string().default('USD'),
  condition: z.string().min(1, 'Condition required'),
  brand: z.string().min(1, 'Brand required'),
  model: z.string().min(1, 'Model required'),
  variant: z.string().optional(),
  year: z.number().optional(),
  storage: z.string().optional(),
  color: z.string().optional(),
  imei: z.string().optional(),
  location: z.string().min(1, 'Location required'),
  category: z.string().min(1, 'Category required'),
});

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
];

const categories = [
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'cameras', label: 'Cameras' },
  { value: 'watches', label: 'Watches' },
  { value: 'monitors', label: 'Monitors' },
  { value: 'gaming', label: 'Gaming' },
];

const currencies = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'TRY', label: 'TRY' },
  { value: 'GBP', label: 'GBP' },
];

type ListingFormData = z.infer<typeof listingSchema>;

export default function CreateListingPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema) as any,
  });

  const onSubmit = async (data: ListingFormData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== '') formData.append(key, String(val));
      });
      files.forEach(f => formData.append('images', f));
      await listingsApi.create(formData);
      toast.success('Listing created successfully!');
      router.push(`/${lang}/dashboard/listings`);
    } catch {
      toast.error('Failed to create listing');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Create Listing</h1>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1">
            <div className={`h-2 rounded-full ${s <= step ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'}`} />
            <p className="text-xs text-surface-500 mt-1">{s === 1 ? 'Details' : s === 2 ? 'Device Info' : 'Images'}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <Card padding="lg" className="space-y-4">
            <Input label="Title" placeholder="e.g. iPhone 15 Pro Max 256GB" error={errors.title?.message} {...register('title')} />
            <div className="relative">
              <textarea
                className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white min-h-[120px]"
                placeholder="Describe your device condition, accessories, etc."
                {...register('description')}
              />
              {errors.description && <p className="text-sm text-danger-600 mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price" type="number" placeholder="999" error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
              <Select label="Currency" options={currencies} {...register('currency')} />
            </div>
            <Input label="Original Price (optional)" type="number" placeholder="1299" {...register('original_price', { valueAsNumber: true })} />
            <Select label="Condition" options={conditions} placeholder="Select condition" error={errors.condition?.message} {...register('condition')} />
            <Select label="Category" options={categories} placeholder="Select category" error={errors.category?.message} {...register('category')} />
            <Input label="Location" placeholder="City, Country" error={errors.location?.message} {...register('location')} />
            <Button type="button" onClick={() => setStep(2)} className="w-full">Next: Device Info <ChevronRight className="h-4 w-4 rtl-flip" /></Button>
          </Card>
        )}

        {step === 2 && (
          <Card padding="lg" className="space-y-4">
            <Input label="Brand" placeholder="e.g. Apple, Samsung" error={errors.brand?.message} {...register('brand')} />
            <Input label="Model" placeholder="e.g. iPhone 15 Pro" error={errors.model?.message} {...register('model')} />
            <Input label="Variant (optional)" placeholder="e.g. Pro Max" {...register('variant')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Year" type="number" placeholder="2024" {...register('year', { valueAsNumber: true })} />
              <Input label="Storage" placeholder="e.g. 256GB" {...register('storage')} />
            </div>
            <Input label="Color" placeholder="e.g. Space Black" {...register('color')} />
            <Input label="IMEI (optional)" placeholder="Enter IMEI for verification" {...register('imei')} helperText="IMEI verification increases buyer trust" />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1"><ChevronLeft className="h-4 w-4 rtl-flip" /> Back</Button>
              <Button type="button" onClick={() => setStep(3)} className="flex-1">Next: Images <ChevronRight className="h-4 w-4 rtl-flip" /></Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card padding="lg" className="space-y-4">
            <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-3 text-surface-400" />
              <p className="text-sm text-surface-600 dark:text-surface-300 mb-1">Drop images here or click to upload</p>
              <p className="text-xs text-surface-400">JPEG, PNG up to 10MB each</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </div>
            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="h-20 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden">
                    <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1"><ChevronLeft className="h-4 w-4 rtl-flip" /> Back</Button>
              <Button type="submit" loading={submitting} className="flex-1">Create Listing</Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
