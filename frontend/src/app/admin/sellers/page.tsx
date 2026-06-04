'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Store, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_TABS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

export default function AdminSellersPage() {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sellers', status, page],
    queryFn: () => adminApi.getSellers({ status: status || undefined, page, limit: 20 }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateSellerStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }); toast.success('Seller status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  const sellers = data?.data || [];
  const pagination = data?.pagination;

  const STATUS_COLORS = {
    PENDING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    APPROVED: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    REJECTED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    SUSPENDED: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sellers Management</h1>
        <span className="text-muted-foreground text-sm">{pagination?.total || 0} sellers</span>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${status === s ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {['Store', 'Owner', 'Products', 'Rating', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 w-full" /></td></tr>
              )) : sellers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <Store className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No sellers found</p>
                </td></tr>
              ) : sellers.map((seller: { id: string; storeName: string; storeSlug: string; status: keyof typeof STATUS_COLORS; rating: number; createdAt: string; user: { name: string; email: string }; _count?: { products: number } }) => (
                <tr key={seller.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amazon-orange/10 flex items-center justify-center">
                        <Store className="w-4 h-4 text-amazon-orange" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{seller.storeName}</p>
                        <p className="text-xs text-muted-foreground">@{seller.storeSlug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{seller.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{seller.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{seller._count?.products || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-amazon-orange text-sm">★</span>
                      <span className="text-sm text-foreground">{seller.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[seller.status] || ''}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(seller.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {seller.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus.mutate({ id: seller.id, status: 'APPROVED' })}
                            className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus.mutate({ id: seller.id, status: 'REJECTED' })}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {seller.status === 'APPROVED' && (
                        <button onClick={() => updateStatus.mutate({ id: seller.id, status: 'SUSPENDED' })}
                          className="p-1.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors" title="Suspend">
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {(seller.status === 'REJECTED' || seller.status === 'SUSPENDED') && (
                        <button onClick={() => updateStatus.mutate({ id: seller.id, status: 'APPROVED' })}
                          className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
