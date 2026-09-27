# XENO — Premium Sportswear Marketplace

A complete, production-ready full-stack e-commerce platform for sportswear, athletic clothing, footwear, and sports equipment. Xeno is a multi-vendor marketplace where vendors can open stores, list products, and manage orders — while customers can browse, search, filter, and purchase from multiple vendors in a single checkout.

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS |
| Backend    | NestJS, TypeScript, REST API |
| Database   | PostgreSQL, Prisma ORM |
| Auth       | JWT (access + refresh tokens), bcrypt |
| Infra      | Docker, Docker Compose |

## Quick Start (Docker)

```bash
# Clone and start everything
git clone https://github.com/Not-Donno/Xeno.git
cd Xeno

# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Build and start all services
docker compose up --build

# Run database migrations (first time only)
docker compose exec backend npx prisma migrate dev --name init

# Seed the database
docker compose exec backend npm run prisma:seed
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432

## Development Accounts (DEV ONLY)

| Role     | Email               | Password      |
|----------|---------------------|---------------|
| Admin    | admin@xeno.com      | Admin123!     |
| Vendor   | velocity@xeno.com   | Vendor123!    |
| Vendor   | apex@xeno.com       | Vendor123!    |
| Vendor   | nova@xeno.com       | Vendor123!    |
| Vendor   | zenith@xeno.com     | Vendor123!    |
| Customer | john@example.com    | Customer123!  |
| Customer | jane@example.com    | Customer123!  |

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### Backend

```bash
cd backend
npm install
cp ../.env.example .env  # configure DATABASE_URL
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Project Structure

```
Xeno/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # Authentication (JWT, refresh tokens, password reset)
│   │   ├── users/            # User profiles, addresses
│   │   ├── vendors/          # Vendor storefronts, applications, dashboards
│   │   ├── products/         # Product CRUD, search, filters, variants
│   │   ├── categories/       # Sport & product-type categories
│   │   ├── brands/           # Brand management
│   │   ├── cart/             # Shopping cart with stock validation
│   │   ├── wishlist/         # Wishlist management
│   │   ├── orders/           # Multi-vendor order system
│   │   ├── payments/         # Payment provider abstraction (test mode)
│   │   ├── reviews/          # Product reviews with verified purchase
│   │   ├── promotions/       # Banners & coupons
│   │   ├── admin/            # Admin dashboard API
│   │   ├── notifications/    # In-app notifications
│   │   ├── uploads/          # File upload endpoint
│   │   ├── storage/          # File storage abstraction (local/S3)
│   │   ├── prisma/           # Prisma service
│   │   └── common/           # Guards, decorators, filters, interceptors
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data (40+ products, vendors, orders)
│   └── Dockerfile
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── products/         # Product listing with filters
│   │   ├── product/[slug]/   # Product detail
│   │   ├── vendors/          # Vendor directory & store pages
│   │   ├── search/           # Search results
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Multi-step checkout
│   │   ├── auth/             # Login, register, forgot password
│   │   ├── account/          # Customer account (orders, wishlist, addresses, reviews, settings)
│   │   ├── admin/            # Admin dashboard (users, vendors, products, orders, reviews, categories, promotions, settings)
│   │   └── vendor/           # Vendor dashboard (products, orders, analytics, profile, settings)
│   ├── components/
│   │   ├── ui/               # Button, Input, Select, Badge, Rating, Price, Skeleton, EmptyState
│   │   ├── layout/           # Header, Footer
│   │   └── products/         # ProductCard
│   ├── lib/                  # API client, auth context, cart context, wishlist context, types, utils
│   └── Dockerfile
├── prisma/                   # (moved to backend/prisma)
├── docker-compose.yml
└── .env.example
```

## Database Schema

Key models: User, Vendor, Product, ProductVariant, ProductImage, Category, Brand, Cart, CartItem, Wishlist, WishlistItem, Address, Order, OrderItem, Payment, Review, ReviewResponse, Coupon, Promotion, Notification, RefreshToken, VerificationToken, Setting

## API Overview

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login (returns JWT + refresh token)
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user profile
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password with token
- `POST /api/auth/verify-email` — Verify email address

### Products
- `GET /api/products` — List products (search, filter, sort, paginate)
- `GET /api/products/:slug` — Product detail
- `GET /api/products/featured` — Featured products
- `GET /api/products/new-arrivals` — New arrivals
- `GET /api/products/trending` — Trending products
- `POST /api/products/vendor/me` — Create product (vendor)
- `PATCH /api/products/vendor/me/:id` — Update product (vendor)
- `DELETE /api/products/vendor/me/:id` — Delete product (vendor)

### Cart
- `GET /api/cart` — Get cart
- `POST /api/cart/items` — Add item
- `PATCH /api/cart/items/:id` — Update quantity
- `DELETE /api/cart/items/:id` — Remove item

### Orders
- `POST /api/orders` — Create order from cart
- `GET /api/orders` — User order history
- `GET /api/orders/:id` — Order detail

### Reviews
- `GET /api/reviews/product/:productId` — Product reviews
- `POST /api/reviews/product/:productId` — Create review (verified purchase)
- `PATCH /api/reviews/:id` — Update review
- `DELETE /api/reviews/:id` — Delete review

### Vendors
- `GET /api/vendors` — List approved vendors
- `GET /api/vendors/:slug` — Vendor store page
- `GET /api/vendors/:slug/products` — Vendor products
- `POST /api/vendors/apply` — Apply to become a vendor
- `GET /api/vendors/me/dashboard` — Vendor dashboard stats
- `GET /api/vendors/me/orders` — Vendor orders

### Admin
- `GET /api/admin/dashboard` — Platform stats
- `GET /api/admin/users` — Manage users
- `GET /api/admin/vendors` — Manage vendors (approve/reject/suspend)
- `GET /api/admin/products` — Manage all products
- `GET /api/admin/orders` — Manage all orders
- `GET /api/admin/reviews` — Moderate reviews
- `GET /api/admin/settings` — Platform settings

## User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse, search, filter, cart, wishlist, checkout, orders, reviews, addresses |
| **Vendor** | All customer features + product CRUD, inventory, order management, store profile, analytics |
| **Admin** | Full platform management: users, vendors, products, categories, orders, reviews, promotions, settings |

## Environment Variables

See `.env.example` for all required variables. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `STORAGE_DRIVER` | File storage driver (local/s3) |
| `NEXT_PUBLIC_API_URL` | Public API URL for the frontend |
| `API_URL` | Internal API URL for Docker networking |

## Features

- **Multi-vendor marketplace** — Multiple vendors, single checkout
- **Product variants** — Size/color combinations with per-variant stock
- **Advanced search & filtering** — By sport, category, brand, vendor, price, size, color, rating, availability, sale
- **Verified reviews** — Only customers who purchased can review; vendor responses supported
- **Vendor storefronts** — Public store pages at `/vendors/:slug`
- **Admin dashboard** — Full platform management with analytics
- **Vendor dashboard** — Product management, order tracking, sales analytics
- **Coupons & promotions** — Discount codes and promotional banners
- **Notifications** — In-app notifications for orders, vendor status, etc.
- **Responsive design** — Mobile, tablet, and desktop optimized
- **SEO-friendly** — Dynamic metadata, semantic URLs with slugs

## Deployment

### Docker (recommended)
```bash
docker compose up --build -d
```

### Manual
1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npx prisma migrate deploy` in backend
4. Run `npm run prisma:seed` in backend
5. Build and start backend: `npm run build && npm run start:prod`
6. Build and start frontend: `npm run build && npm start`

## License

MIT
