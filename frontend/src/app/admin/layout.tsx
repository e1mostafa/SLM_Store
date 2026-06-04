'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Package, ShoppingBag, Store, BarChart2, Tag, Settings, Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/sellers', label: 'Sellers', icon: Store },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') router.push('/auth/login');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-amazon-navy text-white flex flex-col transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link href="/" className="text-amazon-orange font-black text-xl">SLM Store</Link>
          <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amazon-orange flex items-center justify-center text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</div>
            <div><p className="text-sm font-medium text-white">{user.name}</p><p className="text-xs text-white/50">{user.email}</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all', isActive ? 'bg-amazon-orange text-white' : 'text-white/70 hover:text-white hover:bg-white/10')}>
                  <Icon className="w-4 h-4 flex-shrink-0" />{label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={async () => { await logout(); router.push('/'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-muted rounded-md"><Menu className="w-5 h-5 text-foreground" /></button>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to Store</Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
