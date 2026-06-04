'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, Clock, Check, Truck, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';
import { OrderSkeleton } from '@/components/shared/Skeleton';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: Check },
  PROCESSING: { label: 'Processing', color: 'text-purple-600 bg-purple-50', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'text-cyan-600 bg-cyan-50', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: Check },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: X },
  REFUNDED: { label: 'Refunded', color: 'text-gray-600 bg-gray-50', icon: X },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll().then(r => r.data),
    enabled: isAuthenticated,
  });

  const orders = data?.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        <h1 className="text-2xl font-bold text-foreground mb-6">Your Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">When you place an order, it will appear here</p>
            <Link href="/products" className="bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-amazon-orange-dark transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: {
              id: string;
              orderNumber: string;
              status: keyof typeof STATUS_CONFIG;
              createdAt: string;
              total: number;
              items: Array<{ id: string; name: string; quantity: number; price: number }>;
            }) => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-card border border-border rounded-lg hover:border-amazon-orange transition-colors"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="text-xs">ORDER PLACED</span>
                        <p className="text-foreground font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-xs">TOTAL</span>
                        <p className="text-foreground font-medium">EGP {Number(order.total).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{order.orderNumber}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color} mb-2`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>
                      <p className="text-sm text-foreground">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        {order.items?.length > 0 && `: ${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}`}
                      </p>
                    </div>
                    <span className="text-sm text-amazon-orange font-medium">View Details</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
