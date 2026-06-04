'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import { productsApi } from '@/lib/api';
import { getTimeLeft } from '@/lib/utils';

function BigCountdown({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(getTimeLeft(endsAt));
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft(endsAt)), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (!time) return null;
  const units = [
    { label: 'HRS', value: time.hours },
    { label: 'MIN', value: time.minutes },
    { label: 'SEC', value: time.seconds },
  ];
  return (
    <div className="flex items-center gap-3">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="text-center">
            <div className="bg-black/30 rounded-lg px-4 py-2 min-w-[60px]">
              <span className="text-3xl font-black text-white font-mono">{String(value).padStart(2, '0')}</span>
            </div>
            <span className="text-xs text-white/70 font-medium mt-1 block">{label}</span>
          </div>
          {i < 2 && <span className="text-white text-2xl font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function FlashSalePage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['flash-sales-all'],
    queryFn: () => productsApi.getFlashSales().then(r => r.data.data),
  });

  const endsAt = products?.[0]?.flashSaleEndsAt;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500 py-10 px-4">
          <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
                <h1 className="text-3xl md:text-5xl font-black text-white">FLASH SALE</h1>
              </div>
              <p className="text-red-100 text-lg">Unbeatable deals — while stocks last!</p>
            </div>
            {endsAt && (
              <div className="text-center">
                <p className="text-red-100 text-sm font-medium mb-3 uppercase tracking-wider">Sale ends in</p>
                <BigCountdown endsAt={endsAt} />
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="max-w-[1500px] mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-xl font-bold text-foreground">
              {isLoading ? 'Loading...' : `${products?.length || 0} Flash Deals`}
            </h2>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : !products || products.length === 0 ? (
            <div className="text-center py-20">
              <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No flash sales right now</h2>
              <p className="text-muted-foreground">Check back soon for amazing deals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product: Parameters<typeof ProductCard>[0]['product'], i: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
