'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Heart, Bell, Menu, X, User,
  ChevronDown, MapPin, LogOut, Package, Settings,
  Store, Sun, Moon, Globe
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTheme } from 'next-themes';
import { categoriesApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { productIds: wishlistIds } = useWishlistStore();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top bar */}
      <div className="bg-amazon-navy text-white">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="flex items-center h-14 gap-2">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 mr-2">
              <div className="flex items-center gap-1">
                <span className="text-amazon-orange font-black text-2xl tracking-tight">SLM Store</span>
                <span className="text-white text-xs mt-3">®</span>
              </div>
            </Link>

            {/* Location */}
            <button className="hidden md:flex items-center gap-1 text-xs hover:text-amazon-orange transition-colors border border-transparent hover:border-white rounded px-1 py-1">
              <MapPin className="w-4 h-4 text-amazon-orange" />
              <div className="text-left">
                <div className="text-gray-300 text-[10px]">Deliver to</div>
                <div className="font-semibold text-sm">Cairo, EG</div>
              </div>
            </button>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 flex max-w-3xl">
              <div className="flex w-full rounded-md overflow-hidden">
                <select className="bg-gray-200 text-gray-800 text-sm px-2 border-r border-gray-300 focus:outline-none hidden md:block">
                  <option>All</option>
                  {categoriesData?.map((cat: { id: string; name: string }) => (
                    <option key={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="flex-1 px-4 py-2 text-gray-900 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-amazon-orange hover:bg-amazon-orange-dark px-4 flex items-center justify-center transition-colors"
                >
                  <Search className="w-5 h-5 text-amazon-navy" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto md:ml-2">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 hover:text-amazon-orange transition-colors hidden md:block"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Account dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 text-xs border border-transparent hover:border-white rounded px-2 py-1 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <div className="hidden md:block text-left">
                    <div className="text-gray-300 text-[10px]">
                      {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0]}` : 'Hello, Sign in'}
                    </div>
                    <div className="font-semibold text-sm flex items-center gap-1">
                      Account <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                    >
                      {!isAuthenticated ? (
                        <div className="p-4">
                          <Link
                            href="/auth/login"
                            className="block w-full text-center bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold py-2 rounded-md mb-2 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                            New customer?{' '}
                            <Link href="/auth/register" className="text-amazon-orange hover:underline" onClick={() => setIsUserMenuOpen(false)}>
                              Start here
                            </Link>
                          </p>
                        </div>
                      ) : (
                        <div className="py-1">
                          <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setIsUserMenuOpen(false)}>
                            <User className="w-4 h-4" /> My Account
                          </Link>
                          <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setIsUserMenuOpen(false)}>
                            <Package className="w-4 h-4" /> My Orders
                          </Link>
                          <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setIsUserMenuOpen(false)}>
                            <Heart className="w-4 h-4" /> Wishlist
                          </Link>
                          {user?.role === 'SELLER' && (
                            <Link href="/seller/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setIsUserMenuOpen(false)}>
                              <Store className="w-4 h-4" /> Seller Dashboard
                            </Link>
                          )}
                          {user?.role === 'ADMIN' && (
                            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setIsUserMenuOpen(false)}>
                              <Settings className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <hr className="my-1 border-gray-100 dark:border-gray-700" />
                          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-500 w-full">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative hidden md:flex flex-col items-center p-2 hover:text-amazon-orange transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistIds.size > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amazon-orange text-amazon-navy text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistIds.size > 9 ? '9+' : wishlistIds.size}
                  </span>
                )}
                <span className="text-[10px] font-semibold hidden lg:block">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative flex items-end gap-1 p-2 hover:text-amazon-orange transition-colors">
                <div className="relative">
                  <ShoppingCart className="w-7 h-7" />
                  <span className="absolute -top-2 -right-1 bg-amazon-orange text-amazon-navy text-xs font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {itemCount || 0}
                  </span>
                </div>
                <span className="font-bold text-sm hidden md:block">Cart</span>
              </Link>

              {/* Mobile menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-amazon-navy-light text-white">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="flex items-center gap-6 h-10 overflow-x-auto scrollbar-hide">
            <button className="flex items-center gap-1 text-sm font-semibold hover:text-amazon-orange whitespace-nowrap flex-shrink-0">
              <Menu className="w-4 h-4" /> All Categories
            </button>
            {categoriesData?.slice(0, 8).map((cat: { id: string; name: string; slug: string }) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="text-sm hover:text-amazon-orange whitespace-nowrap flex-shrink-0 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/flash-sale" className="text-sm text-amazon-orange font-semibold whitespace-nowrap flex-shrink-0">
              ⚡ Flash Sale
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              <form onSubmit={handleSearch} className="flex mb-4">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button type="submit" className="bg-amazon-orange px-4 rounded-r-md">
                  <Search className="w-4 h-4 text-amazon-navy" />
                </button>
              </form>
              <nav className="space-y-1">
                {!isAuthenticated ? (
                  <>
                    <Link href="/auth/login" className="block py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    <Link href="/auth/register" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
                  </>
                ) : (
                  <>
                    <Link href="/account" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                    <Link href="/orders" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                    <Link href="/wishlist" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Wishlist ({wishlistIds.size})</Link>
                    <button onClick={handleLogout} className="block py-2 text-sm text-red-500 w-full text-left">Sign Out</button>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </header>
  );
}
