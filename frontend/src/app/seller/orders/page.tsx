'use client';

import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function SellerOrdersPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => api.get('/sellers/dashboard/orders').then(r => r.data.data).catch(() => []),
  });

  const orders = Array.isArray(data) ? data : [];

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    CONFIRMED: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    DELIVERED: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    CANCELLED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    SHIPPED: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Orders</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 w-full rounded" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No orders yet</p>
            <p className="text-muted-foreground text-sm">Orders will appear here when customers purchase your products</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  {['Order', 'Product', 'Customer', 'Qty', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((item: { id: string; order?: { orderNumber: string; user?: { name: string }; status: string; createdAt: string }; product?: { name: string }; quantity: number; subtotal: number }) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">#{item.order?.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground line-clamp-1 max-w-[150px]">{item.product?.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.order?.user?.name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">EGP {Number(item.subtotal).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[item.order?.status || ''] || 'text-gray-600 bg-gray-50'}`}>
                        {item.order?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.order?.createdAt ? formatDate(item.order.createdAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
