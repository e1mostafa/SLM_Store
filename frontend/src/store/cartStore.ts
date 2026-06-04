import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '@/lib/api';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  variantId?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    thumbnail?: string;
    stock: number;
    isFlashSale: boolean;
    flashSalePrice?: number;
    seller: { storeName: string };
  };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      itemCount: 0,
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const { data } = await cartApi.get();
          set({
            items: data.data.items,
            subtotal: data.data.subtotal,
            itemCount: data.data.itemCount,
          });
        } catch {
          // not authenticated or error
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (productId, quantity = 1, variantId) => {
        try {
          await cartApi.add({ productId, quantity, variantId });
          await get().fetchCart();
          toast.success('Added to cart!');
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
      },

      updateItem: async (id, quantity) => {
        try {
          await cartApi.update(id, quantity);
          await get().fetchCart();
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || 'Failed to update cart');
        }
      },

      removeItem: async (id) => {
        try {
          await cartApi.remove(id);
          await get().fetchCart();
          toast.success('Item removed from cart');
        } catch {
          toast.error('Failed to remove item');
        }
      },

      clearCart: async () => {
        try {
          await cartApi.clear();
          set({ items: [], subtotal: 0, itemCount: 0 });
        } catch {
          toast.error('Failed to clear cart');
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ itemCount: state.itemCount }),
    }
  )
);
