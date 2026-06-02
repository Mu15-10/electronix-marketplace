'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listingsApi, auctionsApi } from '@/lib/api';
import { Listing } from '@/types';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ChevronLeft, Gavel } from 'lucide-react';

const auctionSchema = z.object({
  start_price: z.number().min(0.01, 'Start price is required'),
  reserve_price: z.number().optional(),
  min_bid_increment: z.number().min(0.01, 'Min bid increment is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  auto_extend: z.boolean().default(false),
});

type AuctionFormData = z.infer<typeof auctionSchema>;

export default function CreateAuctionFromListingPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AuctionFormData>({
    resolver: zodResolver(auctionSchema) as any,
    defaultValues: {
      start_price: 0,
      min_bid_increment: 10,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      auto_extend: true,
    },
  });

  const autoExtend = watch('auto_extend');

  useEffect(() => {
    listingsApi.getById(params.id as string)
      .then(res => {
        setListing(res.data);
        setValue('start_price', res.data.price);
      })
      .catch(() => router.push(`/${lang}/dashboard/listings`))
      .finally(() => setLoading(false));
  }, [params.id]);

  const onSubmit = async (data: AuctionFormData) => {
    setSubmitting(true);
    try {
      await auctionsApi.createFromListing(params.id as string, {
        start_price: data.start_price,
        reserve_price: data.reserve_price || undefined,
        min_bid_increment: data.min_bid_increment,
        start_date: data.start_date,
        end_date: data.end_date,
        auto_extend: data.auto_extend,
      });
      toast.success('Auction created successfully!');
      router.push(`/${lang}/dashboard/auctions`);
    } catch {
      toast.error('Failed to create auction');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  if (!listing) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create Auction</h1>
      </div>

      {/* Selected Listing Preview */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
            {listing.images?.[0] ? (
              <img src={listing.images[0].thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-surface-400"><Gavel className="h-6 w-6" /></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">{listing.title}</h3>
            <p className="text-sm text-surface-500">{listing.brand} {listing.model} · {formatPrice(listing.price, listing.currency)}</p>
            <p className="text-xs text-surface-400">{listing.condition}</p>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Price" type="number" step="0.01"
              error={errors.start_price?.message}
              {...register('start_price', { valueAsNumber: true })}
              helperText="Starting bid amount" />
            <Input label="Reserve Price (optional)" type="number" step="0.01"
              error={errors.reserve_price?.message}
              {...register('reserve_price', { valueAsNumber: true })}
              helperText="Minimum price to sell" />
          </div>

          <Input label="Min Bid Increment" type="number" step="0.01"
            error={errors.min_bid_increment?.message}
            {...register('min_bid_increment', { valueAsNumber: true })}
            helperText="Minimum amount each bid must increase by" />

          <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Schedule</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" type="datetime-local"
                error={errors.start_date?.message}
                {...register('start_date')} />
              <Input label="End Date" type="datetime-local"
                error={errors.end_date?.message}
                {...register('end_date')} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="autoExtend" {...register('auto_extend')}
              checked={autoExtend}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="autoExtend" className="text-sm text-surface-700 dark:text-surface-300 cursor-pointer">
              Auto-extend if bid placed in last 5 minutes
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">
              <Gavel className="h-4 w-4" /> Create Auction
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
