import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const productsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getOne: (slug: string) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getFlashSales: () => api.get('/products/flash-sales'),
  getRecentlyViewed: () => api.get('/products/recently-viewed'),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getOne: (slug: string) => api.get(`/categories/${slug}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: { productId: string; quantity: number; variantId?: string }) =>
    api.post('/cart', data),
  update: (id: string, quantity: number) => api.patch(`/cart/${id}`, { quantity }),
  remove: (id: string) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId: string) => api.post('/wishlist', { productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};

export const ordersApi = {
  create: (data: { addressId: string; paymentMethod: string; couponCode?: string; notes?: string }) =>
    api.post('/orders', data),
  getAll: (params?: Record<string, unknown>) => api.get('/orders/my', { params }),
  getOne: (id: string) => api.get(`/orders/my/${id}`),
  cancel: (id: string) => api.patch(`/orders/my/${id}/cancel`),
};

export const reviewsApi = {
  getByProduct: (productId: string, params?: Record<string, unknown>) =>
    api.get(`/reviews/product/${productId}`, { params }),
  create: (data: { productId: string; rating: number; title?: string; content?: string }) =>
    api.post('/reviews', data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: Partial<{ name: string; phone: string; avatar: string }>) =>
    api.patch('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: Record<string, unknown>) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: Record<string, unknown>) =>
    api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
};

export const couponsApi = {
  validate: (code: string, orderAmount: number) =>
    api.post('/coupons/validate', { code, orderAmount }),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

export const paymentsApi = {
  createStripeIntent: (orderId: string) =>
    api.post('/payments/stripe/create-intent', { orderId }),
  initiatePaymob: (orderId: string) =>
    api.post('/payments/paymob/initiate', { orderId }),
  confirmCOD: (orderId: string) =>
    api.post('/payments/cod/confirm', { orderId }),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/users/${id}`, data),
  getSellers: (params?: Record<string, unknown>) => api.get('/admin/sellers', { params }),
  updateSellerStatus: (id: string, status: string) =>
    api.patch(`/admin/sellers/${id}/status`, { status }),
  getProducts: (params?: Record<string, unknown>) => api.get('/admin/products', { params }),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/products/${id}`, data),
  getRevenue: (days?: number) => api.get('/admin/analytics/revenue', { params: { days } }),
  getOrders: (params?: Record<string, unknown>) => api.get('/orders', { params }),
};

export const sellerApi = {
  register: (data: { storeName: string; description?: string }) =>
    api.post('/sellers/register', data),
  getDashboardStats: () => api.get('/sellers/dashboard/stats'),
  getProducts: (params?: Record<string, unknown>) =>
    api.get('/sellers/dashboard/products', { params }),
  createProduct: (data: Record<string, unknown>) => api.post('/sellers/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.patch(`/sellers/products/${id}`, data),
};
