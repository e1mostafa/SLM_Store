'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import { productsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, sort, page],
    queryFn: () => productsApi.getAll({ search: q, sort, page, limit: 24 }).then(r => r.data),
    enabled: !!q,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  if (!q) {
    return (
      <div className="text-center py-20">
        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Search for anything</h2>
        <p className="text-muted-foreground">Type something in the search bar above</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isLoading ? 'Searching...' : `${pagination?.total?.toLocaleString() || 0} results for`}{' '}
            <span className="text-amazon-orange">"{q}"</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={24} />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product: Parameters<typeof ProductCard>[0]['product']) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.min(pagination.pages, 8) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${page === p ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1500px] mx-auto px-4 py-6 w-full">
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
