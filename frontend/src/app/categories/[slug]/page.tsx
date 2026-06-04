'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import { categoriesApi, productsApi } from '@/lib/api';
import { useState } from 'react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getOne(slug).then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products-by-category', slug, sort, page],
    queryFn: () => productsApi.getAll({ category: slug, sort, page, limit: 24 }).then(r => r.data),
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1500px] mx-auto px-4 py-6 w-full">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-amazon-orange">Home</Link>
          <span className="mx-2">/</span>
          {category?.parent && (
            <>
              <span className="hover:text-amazon-orange">{category.parent.name}</span>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-foreground">{category?.name || slug}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{category?.name || slug}</h1>
            {category?.description && <p className="text-muted-foreground text-sm mt-1">{category.description}</p>}
            {pagination && <p className="text-sm text-muted-foreground mt-1">{pagination.total.toLocaleString()} products</p>}
          </div>
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Subcategories */}
        {category?.children?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {category.children.map((child: { id: string; name: string; slug: string }) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="px-4 py-1.5 bg-muted hover:bg-amazon-orange hover:text-white rounded-full text-sm font-medium transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products */}
        {isLoading ? (
          <ProductGridSkeleton count={24} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📦</p>
            <h2 className="text-xl font-semibold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground">Check back soon or browse other categories</p>
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
      </main>
      <Footer />
    </div>
  );
}
