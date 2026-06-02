'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { ThumbsUp, Star } from 'lucide-react';

const mockReviews = [
  { id: '1', reviewer: { name: 'John D.', avatar: '' }, rating: 5, title: 'Great seller!', content: 'Quick response, item as described, fast shipping. Highly recommend!', date: '2024-01-20', helpful: 12 },
  { id: '2', reviewer: { name: 'Sarah M.', avatar: '' }, rating: 4, title: 'Good experience', content: 'Product was in excellent condition as advertised.', date: '2024-01-15', helpful: 5 },
];

export default function ReviewsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">My Reviews</h1>
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <Card key={review.id} padding="md">
            <div className="flex items-start gap-4">
              <Avatar name={review.reviewer.name} size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-surface-900 dark:text-white">{review.reviewer.name}</p>
                  <span className="text-xs text-surface-400">{formatDate(review.date)}</span>
                </div>
                <Rating value={review.rating} size="sm" readOnly />
                <p className="text-sm font-medium text-surface-900 dark:text-white mt-2">{review.title}</p>
                <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">{review.content}</p>
                <button className="flex items-center gap-1 mt-2 text-xs text-surface-400 hover:text-primary-600">
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({review.helpful})
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
