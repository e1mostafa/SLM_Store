'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Search, Eye, EyeOff, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  ACTIVE: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  DRAFT: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  INACTIVE: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  BANNED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
} as const;

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, status, page],
    queryFn: () => adminApi.getProducts({ search: search || undefined, status: status || undefined, page, limit: 20 }).then(r => r.data),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => adminApi.updateProduct(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Products Management</h1>
        <span className="text-muted-foreground text-sm">{pagination?.total || 0} products</span>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {['Product', 'Seller', 'Category', 'Price', 'Stock', 'Sold', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="skeleton h-10 w-full" /></td></tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No products found</td></tr>
              ) : products.map((product: { id: string; name: string; thumbnail?: string; slug: string; price: number; stock: number; soldCount: number; status: keyof typeof STATUS_COLORS; seller?: { storeName: string }; category?: { name: string } }) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {product.thumbnail && <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />}
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2 max-w-[200px]">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.seller?.storeName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.category?.name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">EGP {Number(product.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <span className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>{product.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{product.soldCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[product.status] || ''}`}>{product.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateProduct.mutate({ id: product.id, data: { status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } })}
                        className={`p-1.5 rounded transition-colors ${product.status === 'ACTIVE' ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                        title={product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {product.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { if (confirm('Ban this product?')) updateProduct.mutate({ id: product.id, data: { status: 'BANNED' } }); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Ban product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-1 py-4 border-t border-border">
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-medium ${page === p ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
