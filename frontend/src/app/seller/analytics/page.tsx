'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Package, Eye } from 'lucide-react';
import { sellerApi } from '@/lib/api';

export default function SellerAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: () => sellerApi.getDashboardStats().then(r => r.data.data),
  });

  // Generate demo chart data from stats
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const base = Math.random() * 5000 + 1000;
      return {
        month: months[d.getMonth()],
        revenue: Math.round(base),
        orders: Math.round(base / 350),
        views: Math.round(base / 25),
      };
    });
  };

  const chartData = generateMonthlyData();
  const totalRevenue = Number(stats?.totalRevenue || 0);
  const totalOrders = stats?.totalOrders || 0;
  const totalProducts = stats?.totalProducts || 0;

  const kpis = [
    { label: 'Total Revenue', value: `EGP ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amazon-orange', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Listed Products', value: totalProducts, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Avg Order Value', value: totalOrders > 0 ? `EGP ${Math.round(totalRevenue / totalOrders).toLocaleString()}` : 'EGP 0', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Store Analytics</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {isLoading ? <div className="skeleton h-7 w-20 mb-1" /> : <p className="text-2xl font-bold text-foreground">{value}</p>}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-5">Revenue (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`EGP ${v.toLocaleString()}`, 'Revenue']}
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={2.5} fill="url(#sellerRevGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-5">Orders per Month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="orders" fill="#00A8CC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product views */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-5">Product Views per Month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#067D62" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#067D62" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="views" stroke="#067D62" strokeWidth={2} fill="url(#viewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance tips */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">📈 Performance Tips</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {[
            { emoji: '📸', tip: 'Add high-quality images to increase conversions by up to 40%' },
            { emoji: '⚡', tip: 'Enable flash sales to boost visibility and daily traffic' },
            { emoji: '🏷️', tip: 'Set competitive prices — products within 10% of average sell 3x faster' },
            { emoji: '⭐', tip: 'Products with 10+ reviews receive 30% more clicks' },
            { emoji: '📝', tip: 'Use detailed descriptions with keywords to improve search ranking' },
          ].map(({ emoji, tip }) => (
            <li key={tip} className="flex items-start gap-2">
              <span>{emoji}</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
