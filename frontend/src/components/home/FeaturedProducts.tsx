'use client';

import Link from 'next/link';
import { ChevronRight, Shield, Truck, RefreshCw, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/Skeleton';

// Featured Products
export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured().then(r => r.data.data),
  });

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Featured Products</h2>
        <Link href="/products" className="flex items-center gap-1 text-amazon-orange text-sm hover:underline">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.slice(0, 10).map((product: Parameters<typeof ProductCard>[0]['product']) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
