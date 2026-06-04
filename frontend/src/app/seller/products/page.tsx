'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit2, Eye, EyeOff } from 'lucide-react';
import { sellerApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  DRAFT: 'text-gray-600 bg-gray-50 dark:bg-gray-800',
  INACTIVE: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
};

export default function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products', page],
    queryFn: () => sellerApi.getProducts({ page, limit: 20 }).then(r => r.data),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => sellerApi.updateProduct(id, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['seller-products'] }); toast.success('Product updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Products</h1>
        <Link href="/seller/products/new" className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {['Product', 'Price', 'Stock', 'Sold', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-10 w-full" /></td></tr>)
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-foreground font-medium mb-1">No products yet</p>
                  <p className="text-muted-foreground text-sm mb-4">Start selling by adding your first product</p>
                  <Link href="/seller/products/new" className="inline-flex items-center gap-2 bg-amazon-orange text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-amazon-orange-dark transition-colors">
                    <Plus className="w-4 h-4" /> Add First Product
                  </Link>
                </td></tr>
              ) : products.map((p: { id: string; name: string; thumbnail?: string; slug: string; price: number; comparePrice?: number; stock: number; soldCount: number; status: string }) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                        {p.thumbnail && <Image src={p.thumbnail} alt={p.name} fill className="object-cover" />}
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2 max-w-[200px]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">EGP {Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${p.stock < 10 ? 'text-red-500' : 'text-foreground'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.soldCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/seller/products/${p.id}/edit`}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => toggleStatus.mutate({ id: p.id, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                        className={`p-1.5 rounded transition-colors ${p.status === 'ACTIVE' ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                        title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {p.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
