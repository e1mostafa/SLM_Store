# 🛒 SLM Store — Full-Stack eCommerce Marketplace

A production-ready Amazon-inspired marketplace platform built with Next.js, Node.js, PostgreSQL, Stripe, and Paymob. Supports Customers, Sellers, and Admins with a complete set of eCommerce features.

![SLM Store Banner](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop)

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, Framer Motion, Shadcn/UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Auth** | JWT (access + refresh tokens), Google OAuth 2.0 |
| **Payments** | Stripe, Paymob (Egypt), Cash on Delivery |
| **Deployment** | Docker, Vercel (frontend), Railway/Render (backend) |
| **State** | Zustand, TanStack Query |

---

## 📁 Project Structure

```
slm-store/
├── frontend/          # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/# Reusable UI components
│   │   ├── lib/       # API client, utilities
│   │   ├── store/     # Zustand global state
│   │   └── styles/    # Global CSS + design tokens
│   └── Dockerfile
├── backend/           # Express API server
│   ├── src/
│   │   ├── modules/   # Feature modules (auth, products, orders…)
│   │   ├── middleware/# Auth, error handling
│   │   ├── config/    # Passport, Logger
│   │   └── database/  # Prisma client, seed data
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
├── docker/
│   ├── nginx/         # Reverse proxy config
│   └── postgres/      # DB init scripts
├── docker-compose.yml
└── README.md
```

---

## ✨ Features

### 👤 Customer
- Register / Login (email + Google OAuth)
- Browse products by category
- Search with smart filters (price, rating, category, sort)
- Product detail with image gallery, reviews, related items
- Shopping cart with real-time updates
- Wishlist (saved items)
- Checkout with address management
- Multiple payment methods (Stripe, Paymob, COD)
- Coupon / promo code support
- Order tracking with visual progress stepper
- Notifications
- Recently viewed products
- Dark / Light mode
- Arabic + English support (RTL ready)

### 🏪 Seller
- Seller registration & approval flow
- Seller dashboard with revenue stats
- Add / edit / manage products
- Inventory management with low-stock alerts
- Order management & fulfillment
- Sales analytics

### 🛡️ Admin
- Full admin panel with sidebar navigation
- User management (activate, suspend, change roles)
- Seller approval / rejection / suspension
- Product management (activate, deactivate, ban)
- Order management with status updates
- Revenue analytics charts (30/90 days)
- Coupon management (create, track usage)
- Platform settings (shipping, commissions)

---

## 🗄️ Database Schema

Key models:
- **User** — Customers, Sellers, Admins
- **Seller** — Store profile, approval status, commission rate
- **Product** — Full product with variants, flash sales, SEO fields
- **Category** — Hierarchical categories (parent/child)
- **Order** — Full order lifecycle with items, payment, address
- **Cart / Wishlist** — Per-user item lists
- **Review** — Verified purchase reviews with ratings
- **Coupon** — Percentage or fixed discount codes
- **Notification** — In-app notification system
- **Banner** — Homepage CMS banners

---

## 🏁 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- npm or yarn

### 1. Clone & install dependencies

```bash
git clone https://github.com/yourname/slm-store.git
cd slm-store

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values

# Root (for Docker)
cp .env.example .env
```

### 3. Set up the database

```bash
cd backend

# Push schema to DB
npx prisma migrate dev --name init

# Seed with demo data
npm run db:seed
```

### 4. Start development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@slmstore.com | Admin@123 |
| Seller | seller@slmstore.com | Seller@123 |
| Customer | customer@slmstore.com | Customer@123 |

---

## 🐳 Docker Deployment

### Start everything with Docker Compose

```bash
# Copy and fill in env vars
cp .env.example .env

# Build and start all services
docker-compose up -d --build

# Run DB migrations inside the backend container
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

Services:
- Frontend → http://localhost:3000
- Backend API → http://localhost:5000
- PostgreSQL → localhost:5432
- Redis → localhost:6379

### With Nginx (production profile)

```bash
docker-compose --profile production up -d
```

---

## ☁️ Vercel Deployment (Frontend)

1. Push frontend to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` → your Railway/Render backend URL
   - `NEXT_PUBLIC_STRIPE_KEY` → Stripe publishable key

---

## 🚂 Railway Deployment (Backend)

1. Create new project on [Railway](https://railway.app)
2. Add PostgreSQL plugin
3. Connect GitHub repo, set root directory to `backend`
4. Set all environment variables from `backend/.env.example`
5. Deploy — Railway auto-detects Dockerfile

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Access token signing secret |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token signing secret |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook endpoint secret |
| `PAYMOB_API_KEY` | Egypt | Paymob API key |
| `GOOGLE_CLIENT_ID` | OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth | Google OAuth client secret |
| `SMTP_HOST` | Email | SMTP server host |
| `CLOUDINARY_CLOUD_NAME` | Images | Cloudinary cloud name |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_STRIPE_KEY` | ✅ | Stripe publishable key |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new account |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| GET | `/auth/google` | Google OAuth login |

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List products (with filters) |
| GET | `/products/:slug` | Get single product |
| GET | `/products/featured` | Featured products |
| GET | `/products/flash-sales` | Flash sale items |

### Cart
| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Get cart |
| POST | `/cart` | Add item |
| PATCH | `/cart/:id` | Update quantity |
| DELETE | `/cart/:id` | Remove item |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders/my` | My orders |
| GET | `/orders/my/:id` | Order detail |
| PATCH | `/orders/my/:id/cancel` | Cancel order |

---

## 🔒 Security Features

- JWT access tokens (15 min) + refresh tokens (7 days)
- Helmet.js security headers
- CORS with allowlist
- Rate limiting (100 req/15 min)
- Bcrypt password hashing (12 rounds)
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- XSS prevention via output encoding
- Refresh token rotation

---

## 🧪 Test Accounts & Coupons

**Coupon Codes:**
- `WELCOME20` — 20% off (max EGP 2000, min order EGP 500)
- `SAVE500` — EGP 500 off (min order EGP 5000)

---

## 📝 License

MIT License — free to use for personal and commercial projects.

---

Built with ❤️ by the SLM Store team.
