'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shield, Truck, RefreshCw, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ProductCard from '@/components/product/ProductCard';

export function BannerStrip() {
  return (
    <section className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/categories/electronics" className="relative h-48 rounded-lg overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=600&h=300&fit=crop"
            alt="Electronics Sale"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center p-6">
            <div>
              <h3 className="text-white font-black text-xl">Electronics</h3>
              <p className="text-blue-200 text-sm mb-3">Up to 60% off</p>
              <span className="bg-white text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full">
                Shop Now
              </span>
            </div>
          </div>
        </Link>

        <Link href="/categories/fashion" className="relative h-48 rounded-lg overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=300&fit=crop"
            alt="Fashion"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/70 to-transparent flex items-center p-6">
            <div>
              <h3 className="text-white font-black text-xl">Fashion</h3>
              <p className="text-pink-200 text-sm mb-3">New arrivals daily</p>
              <span className="bg-white text-pink-900 text-xs font-bold px-3 py-1.5 rounded-full">
                Explore
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export function TrustBadges() {
  const badges = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders over EGP 5,000' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer care' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {badges.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
          <div className="w-10 h-10 rounded-full bg-amazon-orange/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-amazon-orange" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentlyViewed() {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['recently-viewed'],
    queryFn: () => productsApi.getRecentlyViewed().then(r => r.data.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || (!isLoading && (!data || data.length === 0))) return null;

  return (
    <section className="my-8">
      <h2 className="text-xl font-bold text-foreground mb-4">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data?.slice(0, 6).map((product: Parameters<typeof ProductCard>[0]['product']) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default BannerStrip;
