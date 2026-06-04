'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Store, Loader2, Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SellerSettingsPage() {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    newOrder: true,
    lowStock: true,
    reviewReceived: true,
    weeklyReport: false,
  });

  const { data: sellerData, isLoading } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => api.get('/sellers/dashboard/stats').then(r => r.data.data),
    enabled: !!user,
  });

  const [form, setForm] = useState({
    storeName: '',
    description: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 800));
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Store Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store profile */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-amazon-orange" />
            <h2 className="font-semibold text-foreground">Store Profile</h2>
          </div>
          <div>
            <label className={labelClass}>Store Name</label>
            <input value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
              placeholder={user?.name || 'Your Store Name'} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Store Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4} placeholder="Tell customers about your store..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Contact Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+20 1xx xxx xxxx" className={inputClass} />
          </div>
        </div>

        {/* Bank / Payout details */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Payout Information</h2>
          <p className="text-sm text-muted-foreground">Earnings are transferred weekly to your bank account.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Bank Name</label>
              <select value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} className={inputClass}>
                <option value="">Select bank</option>
                {['CIB', 'Banque Misr', 'NBE', 'Alex Bank', 'HSBC Egypt', 'QNB', 'Attijariwafa Bank'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Account Holder Name</label>
              <input value={form.accountHolder} onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))}
                placeholder="Name as on card" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Account Number / IBAN</label>
            <input value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
              placeholder="EG00 0000 0000 0000 0000 0000 0000" className={inputClass} />
          </div>
          <div className="bg-amazon-orange/10 border border-amazon-orange/30 rounded-lg p-3 text-xs text-muted-foreground">
            💡 Payouts are processed every Monday for the previous week's earnings. Minimum payout is EGP 500.
          </div>
        </div>

        {/* Notification preferences */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-amazon-orange" />
            <h2 className="font-semibold text-foreground">Notification Preferences</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'newOrder', label: 'New Order Received', desc: 'Get notified when a customer places an order' },
              { key: 'lowStock', label: 'Low Stock Alert', desc: 'Alert when product stock drops below threshold' },
              { key: 'reviewReceived', label: 'New Review', desc: 'Get notified when a customer leaves a review' },
              { key: 'weeklyReport', label: 'Weekly Sales Report', desc: 'Summary of your weekly performance' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer"
                    checked={notifPrefs[key as keyof typeof notifPrefs]}
                    onChange={e => setNotifPrefs(p => ({ ...p, [key]: e.target.checked }))} />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 peer-checked:bg-amazon-orange rounded-full transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-8 py-3 rounded-md font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </form>
    </div>
  );
}
