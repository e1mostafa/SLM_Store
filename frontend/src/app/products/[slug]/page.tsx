'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star, ShoppingCart, Heart, Zap, Shield, Truck,
  RefreshCw, Share2, ChevronLeft, ChevronRight, Store
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { cn, getDiscountPercent } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getOne(slug).then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-[1500px] mx-auto px-4 py-8 w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-lg" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-10 w-1/3" />
              <div className="skeleton h-32 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">😕</p>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <Link href="/products" className="text-amazon-orange hover:underline">Browse Products</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const effectivePrice = data.isFlashSale && data.flashSalePrice ? Number(data.flashSalePrice) : Number(data.price);
  const discountPct = data.comparePrice ? getDiscountPercent(Number(data.comparePrice), effectivePrice) : 0;
  const wishlisted = isWishlisted(data.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    await addItem(data.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    await addItem(data.id, quantity);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1500px] mx-auto px-4 py-6 w-full">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-amazon-orange">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/categories/${data.category?.slug}`} className="hover:text-amazon-orange">{data.category?.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground line-clamp-1">{data.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_1fr_380px] gap-6">
          {/* Images */}
          <div className="lg:col-span-1">
            <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
              <Image
                src={data.images?.[selectedImage] || data.thumbnail || ''}
                alt={data.name}
                fill
                className="object-contain"
                priority
              />
              {data.isFlashSale && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> FLASH SALE
                </div>
              )}
            </div>
            {data.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {data.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden',
                      selectedImage === i ? 'border-amazon-orange' : 'border-border'
                    )}
                  >
                    <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">{data.name}</h1>

            {/* Seller */}
            {data.seller && (
              <Link href={`/sellers/${data.seller.storeSlug}`} className="flex items-center gap-2 text-sm text-amazon-orange hover:underline mb-3">
                <Store className="w-4 h-4" /> {data.seller.storeName}
              </Link>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('w-4 h-4', i < Math.round(data.rating) ? 'text-amazon-orange fill-amazon-orange' : 'text-gray-300 fill-gray-300')} />
                ))}
              </div>
              <span className="text-sm text-amazon-orange hover:underline cursor-pointer">{data.reviewCount} ratings</span>
            </div>

            <hr className="border-border mb-4" />

            {/* Price */}
            <div className="mb-4">
              {data.isFlashSale && data.flashSalePrice && (
                <div className="text-red-500 text-sm font-medium mb-1">Flash Sale Price</div>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  EGP {effectivePrice.toLocaleString()}
                </span>
                {discountPct > 0 && (
                  <>
                    <span className="text-muted-foreground line-through text-lg">
                      EGP {Number(data.comparePrice).toLocaleString()}
                    </span>
                    <span className="text-red-500 font-medium text-sm">-{discountPct}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 whitespace-pre-line">
              {data.description}
            </p>

            {/* Tags */}
            {data.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reviews preview */}
            {data.reviews?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-3">Customer Reviews</h3>
                <div className="space-y-3">
                  {data.reviews.slice(0, 3).map((review: { id: string; rating: number; title?: string; content?: string; user: { name: string } }) => (
                    <div key={review.id} className="border border-border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn('w-3 h-3', i < review.rating ? 'text-amazon-orange fill-amazon-orange' : 'text-gray-300 fill-gray-300')} />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-foreground">{review.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{review.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">— {review.user.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 sticky top-20">
              <div className="text-2xl font-bold text-foreground mb-2">
                EGP {effectivePrice.toLocaleString()}
              </div>

              <div className="flex items-center gap-1 text-sm text-green-600 mb-3">
                <Truck className="w-4 h-4" />
                {effectivePrice >= 5000 ? 'FREE Delivery' : 'EGP 50 Delivery'}
              </div>

              {/* Stock */}
              <div className="mb-4">
                {data.stock === 0 ? (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                ) : data.stock <= 5 ? (
                  <span className="text-orange-500 font-medium">Only {data.stock} left in stock</span>
                ) : (
                  <span className="text-green-600 font-medium">In Stock</span>
                )}
              </div>

              {/* Quantity */}
              {data.stock > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm text-foreground">Qty:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-input rounded px-2 py-1 text-sm bg-background text-foreground"
                  >
                    {Array.from({ length: Math.min(data.stock, 10) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  disabled={data.stock === 0}
                  className="w-full bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={data.stock === 0}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-amazon-navy font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => toggle(data.id)}
                  className="w-full border border-border hover:bg-muted text-foreground py-2 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Heart className={cn('w-4 h-4', wishlisted ? 'text-red-500 fill-red-500' : '')} />
                  {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              <hr className="border-border my-4" />
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Secure Transaction</div>
                <div className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> 30-day return policy</div>
                <div className="flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> Fast delivery available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {data.related?.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.related.map((p: Parameters<typeof ProductCard>[0]['product']) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
