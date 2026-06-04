'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Settings, Menu, X, LogOut, Store, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'My Products', icon: Package },
  { href: '/seller/products/new', label: 'Add Product', icon: Plus },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/seller/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/seller/settings', label: 'Store Settings', icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') { router.push('/seller/register'); }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-amazon-navy-light text-white flex flex-col transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <Link href="/" className="text-amazon-orange font-black text-lg">SLM Store</Link>
            <p className="text-white/50 text-xs">Seller Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amazon-orange flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-white/50">Seller Account</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all mb-0.5', isActive ? 'bg-amazon-orange text-white' : 'text-white/70 hover:text-white hover:bg-white/10')}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            ← Back to Store
          </Link>
          <button onClick={async () => { await logout(); router.push('/'); }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-white/60 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-muted rounded-md mr-3"><Menu className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-sm font-medium text-muted-foreground">Seller Dashboard</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
