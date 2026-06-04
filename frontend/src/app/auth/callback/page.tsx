'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, fetchMe } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAccessToken(token);
      Promise.all([fetchMe(), fetchCart(), fetchWishlist()]).then(() => {
        router.replace('/');
      });
    } else {
      router.replace('/auth/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amazon-orange mx-auto mb-4" />
        <p className="text-foreground font-medium">Signing you in...</p>
        <p className="text-muted-foreground text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amazon-orange" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
