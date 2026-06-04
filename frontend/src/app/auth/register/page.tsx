'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.register({ name: form.name, email: form.email, password: form.password });
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="text-amazon-orange font-black text-3xl mb-8">SLM Store</Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-foreground mb-6">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Ahmed Hassan' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
              <input
                type={type}
                required
                value={form[id as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm"
                placeholder={placeholder}
              />
              {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 pr-10 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm"
                placeholder="Min 8 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm"
              placeholder="Repeat password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-amazon-orange hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-amazon-orange hover:underline">Privacy Policy</a>.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-amazon-orange hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
