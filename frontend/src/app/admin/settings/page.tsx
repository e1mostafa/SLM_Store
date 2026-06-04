'use client';

import { useState } from 'react';
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [general, setGeneral] = useState({
    siteName: 'SLM Store', siteTagline: "Egypt's #1 Online Marketplace",
    supportEmail: 'support@slmstore.com', supportPhone: '16xxx',
    defaultCurrency: 'EGP', defaultLanguage: 'en',
  });
  const [shipping, setShipping] = useState({ freeShippingThreshold: 5000, defaultShippingCost: 50 });
  const [commissions, setCommissions] = useState({ defaultRate: 10, minRate: 5, maxRate: 25 });

  const save = (section: string) => toast.success(`${section} settings saved!`);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>

      {/* General */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-amazon-orange" />
          <h2 className="font-semibold text-foreground">General Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'siteName', label: 'Site Name' },
            { key: 'siteTagline', label: 'Site Tagline' },
            { key: 'supportEmail', label: 'Support Email' },
            { key: 'supportPhone', label: 'Support Phone' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
              <input value={general[key as keyof typeof general]} onChange={e => setGeneral(g => ({ ...g, [key]: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Default Currency</label>
            <select value={general.defaultCurrency} onChange={e => setGeneral(g => ({ ...g, defaultCurrency: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange">
              <option value="EGP">Egyptian Pound (EGP)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Default Language</label>
            <select value={general.defaultLanguage} onChange={e => setGeneral(g => ({ ...g, defaultLanguage: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange">
              <option value="en">English</option>
              <option value="ar">Arabic (العربية)</option>
            </select>
          </div>
        </div>
        <button onClick={() => save('General')} className="mt-4 flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Shipping */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-amazon-orange" />
          <h2 className="font-semibold text-foreground">Shipping Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Free Shipping Threshold (EGP)</label>
            <input type="number" value={shipping.freeShippingThreshold} onChange={e => setShipping(s => ({ ...s, freeShippingThreshold: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Default Shipping Cost (EGP)</label>
            <input type="number" value={shipping.defaultShippingCost} onChange={e => setShipping(s => ({ ...s, defaultShippingCost: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
          </div>
        </div>
        <button onClick={() => save('Shipping')} className="mt-4 flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Commission */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-amazon-orange" />
          <h2 className="font-semibold text-foreground">Commission Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg">
          {[
            { key: 'defaultRate', label: 'Default Rate (%)' },
            { key: 'minRate', label: 'Minimum Rate (%)' },
            { key: 'maxRate', label: 'Maximum Rate (%)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
              <input type="number" value={commissions[key as keyof typeof commissions]} onChange={e => setCommissions(c => ({ ...c, [key]: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
          ))}
        </div>
        <button onClick={() => save('Commission')} className="mt-4 flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* API Keys info */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5 text-amazon-orange" />
          <h2 className="font-semibold text-foreground">Integration Status</h2>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Stripe Payments', status: !!process.env.NEXT_PUBLIC_STRIPE_KEY, desc: 'Credit/debit card processing' },
            { name: 'Paymob', status: false, desc: 'Egyptian payment gateway' },
            { name: 'Google OAuth', status: true, desc: 'Social login with Google' },
            { name: 'Cloudinary CDN', status: false, desc: 'Image upload and optimization' },
          ].map(({ name, status, desc }) => (
            <div key={name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${status ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'}`}>
                {status ? 'Connected' : 'Not configured'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Configure API keys in your .env file on the backend server.</p>
      </div>
    </div>
  );
}
