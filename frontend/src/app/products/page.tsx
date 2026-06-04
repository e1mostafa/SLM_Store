'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import { productsApi, categoriesApi } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const RATINGS = [4, 3, 2, 1];

interface Filters {
  sort: string;
  minPrice: string;
  maxPrice: string;
  rating: string;
  category: string;
  page: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';

  const [filters, setFilters] = useState<Filters>({
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    rating: '',
    category: categorySlug,
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = {
    search: search || undefined,
    sort: filters.sort,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    rating: filters.rating || undefined,
    category: filters.category || undefined,
    page: filters.page,
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.getAll(queryParams).then(r => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  const updateFilter = useCallback((key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const clearFilters = () => {
    setFilters({ sort: 'newest', minPrice: '', maxPrice: '', rating: '', category: '', page: 1 });
  };

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1500px] mx-auto px-4 py-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            {pagination && (
              <p className="text-sm text-muted-foreground">
                {pagination.total.toLocaleString()} results
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="bg-card border border-border rounded-lg p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Filters</h2>
                <button onClick={clearFilters} className="text-xs text-amazon-orange hover:underline">
                  Clear all
                </button>
              </div>

              {/* Category filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-2">Category</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`block w-full text-left text-sm px-2 py-1.5 rounded ${!filters.category ? 'bg-amazon-orange/10 text-amazon-orange font-medium' : 'text-foreground hover:bg-muted'}`}
                  >
                    All Categories
                  </button>
                  {categoriesData?.map((cat: { id: string; name: string; slug: string }) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`block w-full text-left text-sm px-2 py-1.5 rounded ${filters.category === cat.slug ? 'bg-amazon-orange/10 text-amazon-orange font-medium' : 'text-foreground hover:bg-muted'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-2">Price Range (EGP)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full px-2 py-1.5 border border-input rounded text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full px-2 py-1.5 border border-input rounded text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>
              </div>

              {/* Rating filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Customer Rating</h3>
                <div className="space-y-1">
                  {RATINGS.map(r => (
                    <button
                      key={r}
                      onClick={() => updateFilter('rating', filters.rating === String(r) ? '' : String(r))}
                      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm ${filters.rating === String(r) ? 'bg-amazon-orange/10 text-amazon-orange' : 'text-foreground hover:bg-muted'}`}
                    >
                      <span>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
                      <span>& Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {isLoading ? (
              <ProductGridSkeleton count={20} />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <h2 className="text-xl font-semibold text-foreground mb-2">No products found</h2>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-amazon-orange-dark transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product: Parameters<typeof ProductCard>[0]['product'], i: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setFilters(f => ({ ...f, page: p }))}
                        className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${filters.page === p ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
