'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';

export default function CategoriesSection() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
    'from-red-500 to-red-600',
    'from-yellow-500 to-yellow-600',
  ];

  if (isLoading) {
    return (
      <section className="my-8">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Shop by Category</h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {categories?.map((cat: { id: string; name: string; slug: string; icon?: string }, i: number) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={`/categories/${cat.slug}`}
              className={`flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-br ${colors[i % colors.length]} text-white h-24 gap-2 hover:shadow-lg transition-shadow`}
            >
              <span className="text-2xl">{cat.icon || '🛍️'}</span>
              <span className="text-xs font-semibold text-center leading-tight">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
