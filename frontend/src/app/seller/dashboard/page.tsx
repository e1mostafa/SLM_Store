'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Package, ShoppingBag, TrendingUp, Star, ArrowUpRight } from 'lucide-react';
import { sellerApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: () => sellerApi.getDashboardStats().then(r => r.data.data),
  });

  const kpis = [
    { label: 'Total Revenue', value: `EGP ${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-amazon-orange', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Products Listed', value: stats?.totalProducts || 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Avg. Rating', value: '4.8 ★', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your store and track performance</p>
        </div>
        <Link href="/seller/products/new"
          className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
          + Add Product
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {isLoading ? <div className="skeleton h-7 w-20 mb-1" /> : <p className="text-2xl font-bold text-foreground">{value}</p>}
            <p className="text-sm text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link href="/seller/orders" className="text-sm text-amazon-orange hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><div className="skeleton h-12 w-full" /></div>)
          ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No orders yet</div>
          ) : stats.recentOrders.map((item: {
            id: string; order: { orderNumber: string; user: { name: string }; status: string };
            product: { name: string; thumbnail?: string };
            quantity: number; subtotal: number;
          }) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {item.product?.thumbnail && <Image src={item.product.thumbnail} alt={item.product.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{item.product?.name}</p>
                <p className="text-xs text-muted-foreground">#{item.order?.orderNumber} · {item.order?.user?.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-foreground">EGP {Number(item.subtotal).toLocaleString()}</p>
                <span className={`text-xs ${item.order?.status === 'DELIVERED' ? 'text-green-600' : item.order?.status === 'CANCELLED' ? 'text-red-500' : 'text-yellow-600'}`}>
                  {item.order?.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: '/seller/products', label: 'Manage Products', emoji: '📦', desc: 'Edit and update your listings' },
          { href: '/seller/products/new', label: 'Add New Product', emoji: '➕', desc: 'List a new item for sale' },
          { href: '/seller/orders', label: 'View All Orders', emoji: '🛍️', desc: 'Track and fulfill orders' },
        ].map(({ href, label, emoji, desc }) => (
          <Link key={href} href={href} className="bg-card border border-border rounded-xl p-4 hover:border-amazon-orange transition-colors">
            <div className="text-2xl mb-2">{emoji}</div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
