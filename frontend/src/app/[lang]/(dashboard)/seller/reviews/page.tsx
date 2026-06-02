'use client';

import { Card } from '@/components/ui/card';
import { Rating } from '@/components/ui/rating';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { ThumbsUp, Star } from 'lucide-react';

const mockReviews = [
  { id: '1', user: { name: 'Mike R.', avatar: '' }, rating: 5, content: 'Excellent seller! Fast shipping and item was exactly as described.', date: '2024-01-25', helpful: 8 },
  { id: '2', user: { name: 'Emily K.', avatar: '' }, rating: 4, content: 'Good communication, item in great condition.', date: '2024-01-20', helpful: 3 },
];

export default function SellerReviewsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Seller Reviews</h1>
      <div className="flex items-center gap-2 mb-6">
        <Rating value={4.8} size="md" readOnly />
        <span className="text-lg font-bold text-surface-900 dark:text-white">4.8</span>
        <span className="text-sm text-surface-500">(12 reviews)</span>
      </div>

      <div className="space-y-4">
        {mockReviews.map((r) => (
          <Card key={r.id} padding="md">
            <div className="flex items-start gap-3">
              <Avatar name={r.user.name} size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-surface-900 dark:text-white">{r.user.name}</p>
                  <span className="text-xs text-surface-400">{formatDate(r.date)}</span>
                </div>
                <Rating value={r.rating} size="sm" readOnly />
                <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">{r.content}</p>
                <button className="flex items-center gap-1 mt-2 text-xs text-surface-400 hover:text-primary-600">
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({r.helpful})
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
