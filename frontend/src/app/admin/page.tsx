'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingBag, DollarSign, Store, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  PENDING: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  CONFIRMED: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  DELIVERED: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  CANCELLED: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  PROCESSING: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  SHIPPED: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
} as const;

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => adminApi.getRevenue(30).then(r => r.data.data),
  });

  const chartData = revenueData
    ? Object.entries(revenueData).map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' }),
        revenue: Number(revenue),
      }))
    : [];

  const statCards = [
    { label: 'Total Customers', value: stats?.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', trend: '+12%' },
    { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', trend: '+8%' },
    { label: 'Active Products', value: stats?.totalProducts, icon: Package, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', trend: '+23%' },
    { label: 'Total Revenue', value: `EGP ${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-amazon-orange', bg: 'bg-orange-50 dark:bg-orange-900/20', trend: '+18%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening.</p>
        </div>
        <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Alert for pending sellers */}
      {stats?.pendingSellers > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amazon-orange/10 border border-amazon-orange/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-amazon-orange" />
            <p className="text-sm font-medium text-foreground">
              <span className="text-amazon-orange font-bold">{stats.pendingSellers}</span> seller{stats.pendingSellers > 1 ? 's' : ''} waiting for approval
            </p>
          </div>
          <Link href="/admin/sellers?status=PENDING" className="text-sm bg-amazon-orange text-white px-3 py-1.5 rounded-md hover:bg-amazon-orange-dark transition-colors font-medium">
            Review Now
          </Link>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, trend }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3" />{trend}
              </span>
            </div>
            {isLoading ? (
              <div className="skeleton h-7 w-24 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value ?? 0}</p>
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart + Recent orders */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">Revenue (Last 30 Days)</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">EGP</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`EGP ${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-muted-foreground">No revenue data yet</div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-amazon-orange hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)
            ) : stats?.recentOrders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No orders yet</div>
            ) : stats?.recentOrders?.map((order: { id: string; orderNumber: string; status: keyof typeof STATUS_COLORS; total: number; createdAt: string; user: { name: string; email: string } }) => (
              <Link key={order.id} href={`/admin/orders?id=${order.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-amazon-orange/10 flex items-center justify-center text-amazon-orange font-bold text-xs flex-shrink-0">
                  {order.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{order.user?.name}</p>
                  <p className="text-xs text-muted-foreground">#{order.orderNumber}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-foreground">EGP {Number(order.total).toLocaleString()}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'text-gray-500 bg-gray-50'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
