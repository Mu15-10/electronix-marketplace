'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ListingImage } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

interface ImageGalleryProps {
  images: ListingImage[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images?.length) {
    return (
      <div className="h-96 bg-surface-100 dark:bg-surface-700 rounded-xl flex items-center justify-center text-surface-400">
        No images available
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-3', className)}>
        <div className="relative h-80 sm:h-96 lg:h-[28rem] bg-surface-100 dark:bg-surface-700 rounded-xl overflow-hidden group">
          <Image
            src={images[activeIndex]?.url}
            alt={images[activeIndex]?.alt || 'Product image'}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 end-3 p-2 rounded-lg bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Expand className="h-4 w-4" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute start-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5 rtl-flip" />
              </button>
              <button
                onClick={() => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5 rtl-flip" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  'relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 transition-colors',
                  idx === activeIndex ? 'border-primary-500' : 'border-transparent hover:border-surface-300 dark:hover:border-surface-600'
                )}
              >
                <Image src={img.thumbnail || img.url} alt={img.alt || ''} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button onClick={() => setIsFullscreen(false)} className="absolute top-4 end-4 p-2 text-white/80 hover:text-white">
            <X className="h-6 w-6" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image src={images[activeIndex]?.url} alt="" fill className="object-contain" sizes="100vw" />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={() => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))} className="absolute start-4 p-2 text-white/80 hover:text-white">
                <ChevronLeft className="h-8 w-8 rtl-flip" />
              </button>
              <button onClick={() => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))} className="absolute end-4 p-2 text-white/80 hover:text-white">
                <ChevronRight className="h-8 w-8 rtl-flip" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
