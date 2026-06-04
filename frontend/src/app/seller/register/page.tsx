'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sellerApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

const BENEFITS = [
  '🏪 Your own branded storefront',
  '📊 Real-time sales analytics dashboard',
  '🚀 Reach millions of customers across Egypt',
  '💳 Fast payouts — weekly transfers',
  '🛡️ Seller protection & dispute resolution',
  '📦 Fulfillment support available',
];

export default function SellerRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ storeName: '', description: '' });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <Store className="w-16 h-16 text-amazon-orange mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Start Selling on SLM Store</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to register as a seller</p>
            <Link href="/auth/login" className="bg-amazon-orange text-white px-6 py-2.5 rounded-md font-semibold hover:bg-amazon-orange-dark transition-colors">
              Sign In to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user?.role === 'SELLER') {
    router.push('/seller/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName.trim()) { toast.error('Store name is required'); return; }
    setIsLoading(true);
    try {
      await sellerApi.register({ storeName: form.storeName, description: form.description });
      toast.success('Application submitted! We will review it within 24 hours.');
      router.push('/account');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="amazon-gradient text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Store className="w-14 h-14 text-amazon-orange mx-auto mb-4" />
              <h1 className="text-3xl md:text-5xl font-black mb-4">Sell on SLM Store</h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of sellers reaching millions of customers across Egypt. Start your journey today.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Benefits */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Why Sell on SLM Store?</h2>
              <ul className="space-y-4">
                {BENEFITS.map(benefit => (
                  <li key={benefit} className="flex items-center gap-3 text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="mt-8 bg-amazon-orange/10 border border-amazon-orange/30 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Commission Rates</h3>
                <p className="text-sm text-muted-foreground">We charge competitive commission rates starting from just <strong className="text-amazon-orange">8%</strong> per sale. No monthly fees, no setup costs.</p>
              </div>
            </div>

            {/* Registration form */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-5">Start Your Application</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Store Name *</label>
                  <input required value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
                    placeholder="e.g. TechStore Egypt"
                    className="w-full px-3 py-2.5 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                  />
                  <p className="text-xs text-muted-foreground mt-1">This will be your public store name</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Store Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4} placeholder="Tell customers what you sell..."
                    className="w-full px-3 py-2.5 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange resize-none"
                  />
                </div>
                <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
                  Your application will be reviewed by our team within 24 hours. You'll receive an email notification when approved.
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-bold py-3 rounded-md transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
