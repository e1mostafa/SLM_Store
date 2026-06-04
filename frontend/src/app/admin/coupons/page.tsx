'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '',
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminApi.getStats().then(() => {
      // Reuse the coupon validate endpoint by listing from admin api
      const { api } = require('@/lib/api');
      return api.get('/coupons').then((r: { data: { data: unknown } }) => r.data.data);
    }),
  });

  const createCoupon = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const { api } = require('@/lib/api');
      return api.post('/coupons', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon created!');
      setShowForm(false);
      setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '' });
    },
    onError: () => toast.error('Failed to create coupon'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCoupon.mutate({
      code: form.code.toUpperCase(),
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      expiresAt: form.expiresAt || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Coupons & Promotions</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-5">New Coupon</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Coupon Code *</label>
              <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20" className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="20% off for all customers" className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Discount Type *</label>
              <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (EGP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Discount Value *</label>
              <input required type="number" min="0" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                placeholder={form.discountType === 'percentage' ? '20' : '500'} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Min Order Amount (EGP)</label>
              <input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                placeholder="500" className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Discount (EGP)</label>
              <input type="number" min="0" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                placeholder="2000" className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Usage Limit</label>
              <input type="number" min="1" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                placeholder="1000" className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={createCoupon.isPending}
                className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors">
                {createCoupon.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Coupon
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-border text-foreground px-4 py-2 rounded-md text-sm hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {['Code', 'Description', 'Discount', 'Min Order', 'Used / Limit', 'Expires', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 w-full" /></td></tr>
                ))
              ) : !coupons || (coupons as unknown[]).length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No coupons yet</p>
                </td></tr>
              ) : (coupons as Array<{
                id: string; code: string; description?: string; discountType: string;
                discountValue: number; minOrderAmount?: number; usedCount: number;
                usageLimit?: number; isActive: boolean; expiresAt?: string;
              }>).map(coupon => (
                <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-bold text-amazon-orange bg-amazon-orange/10 px-2 py-1 rounded">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{coupon.description || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `EGP ${coupon.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {coupon.minOrderAmount ? `EGP ${Number(coupon.minOrderAmount).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${coupon.isActive ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
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
