'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/Skeleton';
import { getTimeLeft } from '@/lib/utils';

function Countdown({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(getTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!time) return <span className="text-red-400 text-sm">Ended</span>;

  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      <span className="bg-black/30 px-1.5 py-0.5 rounded text-white font-bold">
        {String(time.hours).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-black/30 px-1.5 py-0.5 rounded text-white font-bold">
        {String(time.minutes).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-black/30 px-1.5 py-0.5 rounded text-white font-bold">
        {String(time.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function FlashSaleSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['flash-sales'],
    queryFn: () => productsApi.getFlashSales().then(r => r.data.data),
  });

  if (!isLoading && (!data || data.length === 0)) return null;

  const endsAt = data?.[0]?.flashSaleEndsAt;

  return (
    <section className="my-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-1.5">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-white font-black text-lg md:text-xl tracking-wide">⚡ FLASH SALE</span>
          {endsAt && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-white/80 text-sm">Ends in:</span>
              <Countdown endsAt={endsAt} />
            </div>
          )}
        </div>
        <Link
          href="/flash-sale"
          className="flex items-center gap-1 text-white text-sm font-medium hover:underline"
        >
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.slice(0, 5).map((product: Parameters<typeof ProductCard>[0]['product']) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
