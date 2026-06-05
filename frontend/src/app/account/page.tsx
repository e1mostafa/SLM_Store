'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, MapPin, Lock, Package, Heart, Store, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile().then(r => r.data.data),
    enabled: isAuthenticated,
  });

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => usersApi.getAddresses().then(r => r.data.data),
    enabled: isAuthenticated,
  });

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  useEffect(() => {
    if (profile) setProfileForm({ name: profile.name || '', phone: profile.phone || '' });
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: typeof profileForm) => usersApi.updateProfile(data),
    onSuccess: ({ data }) => {
      setUser(data.data);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      const { api } = await import('@/lib/api');
      await api.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', country: 'Egypt', zipCode: '', isDefault: false });

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.addAddress(addressForm);
      toast.success('Address added!');
      setShowAddressForm(false);
      refetchAddresses();
      setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', country: 'Egypt', zipCode: '', isDefault: false });
    } catch { toast.error('Failed to add address'); }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try { await usersApi.deleteAddress(id); toast.success('Address deleted'); refetchAddresses(); }
    catch { toast.error('Failed to delete address'); }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Account</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { href: '/orders', icon: Package, label: 'My Orders', count: profile?._count?.orders },
            { href: '/wishlist', icon: Heart, label: 'Wishlist', count: profile?._count?.wishlistItems },
            { href: user?.role === 'SELLER' ? '/seller/dashboard' : '/seller/register', icon: Store, label: user?.role === 'SELLER' ? 'Seller Dashboard' : 'Become a Seller' },
            { href: '/account?tab=addresses', icon: MapPin, label: 'Addresses', count: addresses?.length },
          ].map(({ href, icon: Icon, label, count }) => (
            <Link key={label} href={href} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:border-amazon-orange transition-colors">
              <div className="w-10 h-10 rounded-full bg-amazon-orange/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-amazon-orange" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                {count !== undefined && <p className="text-xs text-muted-foreground">{count} items</p>}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <div className="bg-card border border-border rounded-lg p-2 h-fit">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === id ? 'bg-amazon-orange text-white' : 'text-foreground hover:bg-muted'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-semibold text-foreground mb-5">Personal Information</h2>
                {isLoading ? <div className="space-y-3"><div className="skeleton h-10 w-full" /><div className="skeleton h-10 w-full" /></div> : (
                  <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(profileForm); }} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                      <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                      <input value={profile?.email || ''} disabled
                        className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground text-sm cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+20 1xx xxx xxxx"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Account Type</label>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amazon-orange/10 text-amazon-orange rounded-full text-sm font-medium">
                        {profile?.role}
                      </div>
                    </div>
                    <button type="submit" disabled={updateProfile.isPending}
                      className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors">
                      {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-foreground">Saved Addresses</h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={addAddress} className="bg-muted rounded-lg p-4 mb-4 space-y-3">
                    <h3 className="font-medium text-foreground">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'fullName', placeholder: 'Full Name', label: 'Full Name' },
                        { key: 'phone', placeholder: '+20 1xx xxx xxxx', label: 'Phone' },
                        { key: 'street', placeholder: '123 Main St', label: 'Street' },
                        { key: 'city', placeholder: 'Cairo', label: 'City' },
                        { key: 'state', placeholder: 'Cairo', label: 'State/Governorate' },
                        { key: 'zipCode', placeholder: '11511', label: 'ZIP Code' },
                      ].map(({ key, placeholder, label }) => (
                        <div key={key} className={key === 'street' ? 'col-span-2' : ''}>
                          <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
                          <input required value={addressForm[key as keyof typeof addressForm] as string}
                            onChange={e => setAddressForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full px-3 py-2 border border-input rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                          />
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" checked={addressForm.isDefault}
                        onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))}
                        className="rounded"
                      />
                      Set as default address
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded text-sm font-medium transition-colors">Save Address</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="border border-border text-foreground px-4 py-2 rounded text-sm hover:bg-muted transition-colors">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {!addresses || addresses.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No saved addresses yet</p>
                    </div>
                  ) : addresses.map((addr: { id: string; fullName: string; street: string; city: string; state: string; country: string; phone: string; zipCode: string; isDefault: boolean }) => (
                    <div key={addr.id} className="border border-border rounded-lg p-4 flex items-start justify-between">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{addr.fullName}</p>
                          {addr.isDefault && <span className="text-xs bg-amazon-orange/10 text-amazon-orange px-2 py-0.5 rounded-full font-medium">Default</span>}
                        </div>
                        <p className="text-muted-foreground">{addr.street}</p>
                        <p className="text-muted-foreground">{addr.city}, {addr.state}, {addr.country} {addr.zipCode}</p>
                        <p className="text-muted-foreground">{addr.phone}</p>
                      </div>
                      <button onClick={() => deleteAddress(addr.id)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-semibold text-foreground mb-5">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {[
                    { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                    { key: 'newPassword', label: 'New Password', placeholder: 'Min 8 characters' },
                    { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                      <input type="password" required value={pwForm[key as keyof typeof pwForm]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm"
                      />
                    </div>
                  ))}
                  <button type="submit" disabled={pwLoading}
                    className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors">
                    {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
