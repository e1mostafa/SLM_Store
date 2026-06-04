'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Package } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  CONFIRMED: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  PROCESSING: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  SHIPPED: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
  DELIVERED: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  CANCELLED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  REFUNDED: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-600',
  PAID: 'text-green-600',
  FAILED: 'text-red-600',
  REFUNDED: 'text-gray-600',
};

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn: () => adminApi.getOrders({ status: status || undefined, page, limit: 20 }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      const { api } = require('@/lib/api');
      return api.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Orders Management</h1>
        <span className="text-muted-foreground text-sm">{pagination?.total || 0} orders</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setStatus(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!status ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}>
          All
        </button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === s ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="skeleton h-10 w-full" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No orders found</p>
                </td></tr>
              ) : orders.map((order: {
                id: string; orderNumber: string; status: string; paymentStatus: string;
                total: number; createdAt: string;
                user: { name: string; email: string };
                items: Array<{ name: string; quantity: number; price: number }>;
              }) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-foreground">#{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{order.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{order.items?.length || 0} items</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">EGP {Number(order.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus] || 'text-foreground'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value })}
                      className="text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pagination.pages}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${page === p ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
