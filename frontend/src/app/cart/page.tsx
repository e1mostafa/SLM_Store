'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, fetchCart, updateItem, removeItem, isLoading } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is waiting</h2>
            <p className="text-muted-foreground mb-4">Sign in to view your cart</p>
            <Link href="/auth/login" className="bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-amazon-orange-dark transition-colors">
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const shipping = subtotal >= 5000 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1500px] mx-auto px-4 py-6 w-full">
        <h1 className="text-2xl font-bold text-foreground mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet</p>
            <Link href="/products" className="bg-amazon-orange text-white px-8 py-3 rounded-md hover:bg-amazon-orange-dark transition-colors font-semibold">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            {/* Cart items */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">{items.length} item{items.length !== 1 ? 's' : ''} in cart</h2>
              </div>
              <div className="divide-y divide-border">
                <AnimatePresence>
                  {items.map((item) => {
                    const effectivePrice = item.product.isFlashSale && item.product.flashSalePrice
                      ? item.product.flashSalePrice
                      : item.product.price;
                    const itemTotal = effectivePrice * item.quantity;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4 p-4"
                      >
                        {/* Image */}
                        <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                          <div className="relative w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden">
                            {item.product.thumbnail && (
                              <Image src={item.product.thumbnail} alt={item.product.name} fill className="object-cover" />
                            )}
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product.slug}`}>
                            <h3 className="text-sm font-medium text-foreground hover:text-amazon-orange transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">by {item.product.seller?.storeName}</p>

                          {item.product.isFlashSale && (
                            <span className="inline-block mt-1 text-xs text-red-500 font-medium">⚡ Flash Sale</span>
                          )}

                          <div className="flex items-center gap-4 mt-3">
                            {/* Quantity control */}
                            <div className="flex items-center border border-border rounded">
                              <button
                                onClick={() => updateItem(item.id, item.quantity - 1)}
                                className="p-1.5 hover:bg-muted transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="p-1.5 hover:bg-muted transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-foreground">EGP {itemTotal.toLocaleString()}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">EGP {effectivePrice.toLocaleString()} each</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-card border border-border rounded-lg p-5 sticky top-20">
                <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                    <span>EGP {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `EGP ${shipping}`}
                    </span>
                  </div>
                  {subtotal < 5000 && (
                    <p className="text-xs text-muted-foreground">
                      Add EGP {(5000 - subtotal).toLocaleString()} more for free delivery
                    </p>
                  )}
                </div>

                <hr className="border-border mb-4" />

                <div className="flex justify-between font-bold text-lg text-foreground mb-5">
                  <span>Total</span>
                  <span>EGP {total.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <Link href="/products" className="block text-center text-sm text-amazon-orange hover:underline mt-3">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
