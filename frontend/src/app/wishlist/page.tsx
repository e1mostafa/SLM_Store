'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { wishlistApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle } = useWishlistStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get().then(r => r.data.data),
    enabled: isAuthenticated,
  });

  const handleRemove = async (productId: string) => {
    await toggle(productId);
    refetch();
  };

  const handleAddToCart = async (productId: string) => {
    await addItem(productId, 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-[1500px] mx-auto px-4 py-6 w-full">
          <div className="skeleton h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-lg" />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1500px] mx-auto px-4 py-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-amazon-orange fill-amazon-orange" />
          <h1 className="text-2xl font-bold text-foreground">
            My Wishlist {data?.length > 0 && <span className="text-muted-foreground text-lg">({data.length})</span>}
          </h1>
        </div>

        {!data || data.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you love by clicking the heart icon</p>
            <Link href="/products" className="bg-amazon-orange text-white px-8 py-3 rounded-md hover:bg-amazon-orange-dark transition-colors font-semibold">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.map((item: { id: string; product: { id: string; name: string; slug: string; price: number; comparePrice?: number; thumbnail?: string; stock: number; isFlashSale: boolean; flashSalePrice?: number; rating: number; reviewCount: number } }, i: number) => {
              const { product } = item;
              const effectivePrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
                    <Link href={`/products/${product.slug}`}>
                      {product.thumbnail && (
                        <Image src={product.thumbnail} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                      )}
                    </Link>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                    {product.isFlashSale && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">⚡ FLASH</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-sm font-medium text-foreground line-clamp-2 hover:text-amazon-orange transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-bold text-foreground">EGP {Number(effectivePrice).toLocaleString()}</span>
                      {product.comparePrice && Number(product.comparePrice) > Number(effectivePrice) && (
                        <span className="text-xs text-muted-foreground line-through">EGP {Number(product.comparePrice).toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className={cn(
                        'w-full py-2 rounded text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors',
                        product.stock === 0
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-amazon-orange hover:bg-amazon-orange-dark text-white'
                      )}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
