'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Verified, Award, Calendar, Package } from 'lucide-react';

interface SellerCardProps {
  seller: User;
}

export function SellerCard({ seller }: SellerCardProps) {
  const params = useParams();
  const lang = params.lang as string;

  return (
    <Link href={`/${lang}/sellers/${seller.id}`} className="block bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 sm:p-6 card-hover">
      <div className="flex items-center gap-4 mb-4">
        <Avatar src={seller.avatar} name={seller.full_name} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-surface-900 dark:text-white truncate">{seller.full_name}</h3>
            {seller.is_verified && <Verified className="h-4 w-4 text-primary-500" />}
            {seller.seller_level && (
              <Badge variant="primary" size="sm">
                Level {seller.seller_level}
              </Badge>
            )}
          </div>
          <p className="text-sm text-surface-500">@{seller.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-400 mb-3">
        {seller.seller_rating && (
          <div className="flex items-center gap-1">
            <Rating value={seller.seller_rating} size="sm" readOnly />
            <span>({seller.seller_rating.toFixed(1)})</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>Joined {formatDate(seller.created_at)}</span>
        </div>
        {seller.total_sales !== undefined && (
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span>{seller.total_sales} sales</span>
          </div>
        )}
      </div>
    </Link>
  );
}
