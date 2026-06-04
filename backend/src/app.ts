import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { setupPassport } from './config/passport';

// Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import productRoutes from './modules/products/products.routes';
import categoryRoutes from './modules/categories/categories.routes';
import cartRoutes from './modules/cart/cart.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import orderRoutes from './modules/orders/orders.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import sellerRoutes from './modules/sellers/sellers.routes';
import adminRoutes from './modules/admin/admin.routes';
import paymentRoutes from './modules/payments/payments.routes';
import couponRoutes from './modules/coupons/coupons.routes';
import notificationRoutes from './modules/notifications/notifications.routes';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// FIX: Stripe webhook must receive raw body for signature verification.
// Mount it BEFORE express.json() so the raw buffer is preserved.
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parsing (all other routes get JSON parsing)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Passport
setupPassport();
app.use(passport.initialize());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const API_PREFIX = '/api';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/sellers`, sellerRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/coupons`, couponRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
