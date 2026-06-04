import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => {
        set({ accessToken: token });
        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem('accessToken', token);
          else localStorage.removeItem('accessToken');
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const { user, accessToken } = data.data;
          get().setAccessToken(accessToken);
          set({ user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {}
        get().setAccessToken(null);
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
          get().setAccessToken(null);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
);
