'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnail?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFlashSale: boolean;
  flashSalePrice?: number;
  seller?: { storeName: string };
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const wishlisted = isWishlisted(product.id);
  const effectivePrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price;

  const discountPct = product.comparePrice
    ? Math.round((1 - effectivePrice / product.comparePrice) * 100)
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    await addItem(product.id, 1);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    await toggle(product.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative bg-card border border-border rounded-lg overflow-hidden product-card-hover',
        className
      )}
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFlashSale && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> FLASH
              </span>
            )}
            {discountPct && discountPct > 0 && (
              <span className="bg-amazon-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discountPct}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Wishlist btn */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
          >
            <Heart
              className={cn('w-4 h-4 transition-colors', wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500')}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {product.seller && (
            <p className="text-[10px] text-muted-foreground mb-0.5 truncate">
              by {product.seller.storeName}
            </p>
          )}

          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3',
                    i < Math.floor(product.rating)
                      ? 'text-amazon-orange fill-amazon-orange'
                      : i < product.rating
                      ? 'text-amazon-orange fill-amazon-orange/50'
                      : 'text-gray-300 fill-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              EGP {effectivePrice.toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > effectivePrice && (
              <span className="text-xs text-muted-foreground line-through">
                EGP {product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={cn(
            'w-full py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2',
            product.stock === 0
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-amazon-orange hover:bg-amazon-orange-dark text-white active:scale-95'
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
