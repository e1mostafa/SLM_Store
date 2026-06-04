'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { adminApi } from '@/lib/api';

const COLORS = ['#FF9900', '#00A8CC', '#067D62', '#37475A', '#E47911', '#131921'];

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(r => r.data.data),
  });

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['admin-revenue', days],
    queryFn: () => adminApi.getRevenue(days).then(r => r.data.data),
  });

  const chartData = revenueData
    ? Object.entries(revenueData).map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' }),
        revenue: Number(revenue),
        orders: Math.floor(Number(revenue) / 3000 + Math.random() * 5), // demo
      }))
    : [];

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const categoryData = [
    { name: 'Electronics', value: 45 },
    { name: 'Fashion', value: 20 },
    { name: 'Home', value: 15 },
    { name: 'Sports', value: 12 },
    { name: 'Beauty', value: 8 },
  ];

  const kpis = [
    { label: 'Total Revenue', value: `EGP ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amazon-orange', bg: 'bg-orange-50 dark:bg-orange-900/20', trend: '+18%', up: true },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', trend: '+12%', up: true },
    { label: 'Avg Order Value', value: `EGP ${avgOrderValue.toFixed(0)}`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', trend: '+5%', up: true },
    { label: 'Active Customers', value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', trend: '-2%', up: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
        <select value={days} onChange={e => setDays(Number(e.target.value))}
          className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, trend, up }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue area chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-5">Revenue Trend</h2>
        {isLoading ? (
          <div className="skeleton h-64 w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`EGP ${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders bar chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-5">Orders Per Day</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="orders" fill="#FF9900" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-5">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={3} dataKey="value">
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, 'Share']}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Customers', value: stats?.totalUsers || 0, icon: '👥' },
            { label: 'Active Sellers', value: stats?.totalSellers || 0, icon: '🏪' },
            { label: 'Listed Products', value: stats?.totalProducts || 0, icon: '📦' },
            { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛍️' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-2xl font-bold text-foreground">{Number(value).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
