import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface WishlistState {
  productIds: Set<string>;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: new Set(),
      isLoading: false,

      fetchWishlist: async () => {
        try {
          const { data } = await wishlistApi.get();
          const ids = new Set<string>(data.data.map((item: { product: { id: string } }) => item.product.id));
          set({ productIds: ids });
        } catch {}
      },

      toggle: async (productId) => {
        const { productIds } = get();
        const wasWishlisted = productIds.has(productId);

        // Optimistic update
        const newIds = new Set(productIds);
        if (wasWishlisted) {
          newIds.delete(productId);
        } else {
          newIds.add(productId);
        }
        set({ productIds: newIds });

        try {
          if (wasWishlisted) {
            await wishlistApi.remove(productId);
            toast.success('Removed from wishlist');
          } else {
            await wishlistApi.add(productId);
            toast.success('Added to wishlist!');
          }
        } catch {
          // Revert on error
          set({ productIds });
          toast.error('Failed to update wishlist');
        }
      },

      isWishlisted: (productId) => get().productIds.has(productId),
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ productIds: Array.from(state.productIds) }),
      merge: (persisted: unknown, current) => {
        const p = persisted as { productIds?: string[] };
        return {
          ...current,
          productIds: new Set(p?.productIds || []),
        };
      },
    }
  )
);
