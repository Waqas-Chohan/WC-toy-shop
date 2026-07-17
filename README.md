# WC ToyShop Pro 🧸

> A full-stack, production-ready toy e-commerce platform with an AI-powered admin dashboard, real-time order tracking, and Supabase backend.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Custom CSS variables |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **State** | Zustand (client-side) + Supabase realtime |
| **UI Components** | Radix UI + shadcn/ui |
| **Charts** | Recharts |
| **Notifications** | Sonner |

---

## 📁 Project Structure

```
toy-shop-frontend-build/
├── app/                         # Next.js App Router pages
│   ├── layout.tsx               # Root layout (storefront chrome)
│   ├── page.tsx                 # Homepage (hero + featured products)
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout (suppresses storefront UI)
│   │   └── dashboard/
│   │       └── page.tsx         # Admin dashboard page (protected)
│   ├── products/
│   │   ├── page.tsx             # Product catalog
│   │   └── [slug]/
│   │       └── page.tsx         # Product detail page
│   ├── cart/
│   │   └── page.tsx             # Shopping cart
│   ├── checkout/
│   │   └── page.tsx             # Checkout flow
│   ├── wishlist/
│   │   └── page.tsx             # Wishlist
│   ├── orders/
│   │   └── page.tsx             # Customer order tracking (realtime)
│   └── api/                     # Next.js API routes (server-side)
│       ├── orders/route.ts      # GET/POST/PUT orders
│       ├── cart/route.ts        # GET/POST/DELETE cart items
│       ├── wishlist/route.ts    # GET/POST/DELETE wishlist
│       ├── products/route.ts    # GET products
│       ├── sliders/route.ts     # GET/POST/PUT/DELETE hero slides
│       ├── upload-image/route.ts # Image upload to Supabase Storage
│       └── admin/
│           └── users/route.ts   # Admin: list/create/delete users
│               └── dashboard/
│                   └── summary/route.ts  # Dashboard real stats
│
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx        # Login/signup modal (admin vs customer)
│   ├── cart/
│   │   ├── CartDrawer.tsx       # Slide-out cart
│   │   └── CartItem.tsx
│   ├── chat/
│   │   ├── ChatBot.tsx          # AI chatbot widget
│   │   └── WhatsAppButton.tsx   # WhatsApp CTA
│   ├── dashboard/               # Admin dashboard components
│   │   ├── sidebar.tsx          # Dashboard navigation sidebar
│   │   ├── header.tsx           # Dashboard header
│   │   ├── metric-card.tsx      # KPI metric card
│   │   ├── recent-deals.tsx     # Recent orders widget
│   │   ├── top-performers.tsx   # Top products widget
│   │   ├── charts/
│   │   │   ├── revenue-chart.tsx     # Real monthly revenue chart
│   │   │   └── pipeline-overview.tsx # Order pipeline chart
│   │   └── sections/            # Dashboard content sections
│   │       ├── overview.tsx     # Dashboard overview (real KPIs)
│   │       ├── toys.tsx         # Product CRUD management
│   │       ├── sliders.tsx      # Homepage carousel management
│   │       ├── orders.tsx       # Order status management
│   │       ├── customers.tsx    # User management (register/delete)
│   │       ├── deals.tsx
│   │       ├── pipeline.tsx
│   │       ├── team.tsx
│   │       ├── forecasting.tsx
│   │       ├── reports.tsx
│   │       └── settings.tsx
│   ├── hero/
│   │   └── HeroCarousel.tsx     # Homepage hero slider (from DB)
│   ├── layout/
│   │   ├── Header.tsx           # Storefront header (hidden in admin)
│   │   ├── Sidebar.tsx          # Storefront sidebar
│   │   ├── MainLayout.tsx       # Layout switcher (storefront vs admin)
│   │   ├── StorefrontShell.tsx  # Client-side chrome (hides in admin)
│   │   └── ThemeToggle.tsx
│   ├── product/                 # Product cards, grid, filters
│   ├── providers/               # Context providers (Theme, Sidebar)
│   └── ui/                      # shadcn/ui component library
│
├── stores/                      # Zustand global stores
│   ├── authStore.ts             # Authentication (Supabase Auth)
│   ├── cartStore.ts             # Shopping cart
│   ├── wishlistStore.ts         # Wishlist
│   └── productStore.ts          # Products/slides
│
├── lib/
│   ├── supabase.ts              # Supabase browser + server clients
│   ├── admin-auth.ts            # Server-side admin validation helper
│   ├── imageUtils.ts            # Image upload helpers
│   └── utils.ts                 # Shared utilities (cn, etc.)
│
├── types/
│   └── index.ts                 # Shared TypeScript interfaces
│
├── styles/                      # Global stylesheets
├── public/                      # Static assets (logo, images)
├── .env.local                   # Environment variables (not committed)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account and project

### 1. Clone & Install

```bash
git clone https://github.com/Waqas-Chohan/WC-toy-shop.git
cd WC-toy-shop
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Never commit `.env.local`** — it's in `.gitignore`.

### 3. Set Up the Database

1. Open your Supabase project → **SQL Editor**
2. Copy and run the full migration from `supabase_migration.sql` (provided separately)
3. This creates all tables, RLS policies, triggers, storage buckets, and seed data

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication

| Role | Access |
|---|---|
| **Guest** | Browse products, view prices |
| **Customer** | Add to cart, wishlist, place orders, track order status |
| **Admin** | Full dashboard access, manage products/slides/users/orders |

**Admin emails** (auto-promoted on login):
- `waqaschohan3355@gmail.com`
- `f233041@cfd.nu.edu.pk`

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `user_profiles` | Extended user data (name, role: admin/customer) |
| `products` | Toy catalog with images, pricing, stock |
| `hero_slides` | Homepage carousel slides |
| `cart_items` | Per-user persistent cart |
| `wishlist` | Per-user saved products |
| `orders` | Orders with status (pending → prepared → dispatched → delivered) |
| `order_items` | Line items per order |

---

## ✨ Features

### Storefront
- 🎠 Dynamic hero carousel (managed from admin)
- 🛍️ Product catalog with search and category filters
- 🛒 Slide-out shopping cart with quantity controls
- ❤️ Wishlist
- 💳 Checkout flow with order placement
- 📦 **Real-time order tracking** — live status updates as admin changes them

### Admin Dashboard (`/admin/dashboard`)
- 📊 **Live KPI metrics**: revenue, orders, users, carts
- 📈 **Monthly revenue chart** from real delivered orders
- 🧸 **Manage Toys**: add/edit/delete products with image upload to Supabase Storage
- 🖼️ **Manage Sliders**: update homepage carousel content
- 👥 **Customer management**: view all users, their carts/wishlists/orders, register new users, delete users
- 🚚 **Order management**: update order status, revenue auto-calculated from delivered orders

---

## 🌐 Deployment

Deploy to [Vercel](https://vercel.com) for zero-config Next.js hosting:

1. Push to GitHub
2. Import project in Vercel
3. Add your `.env.local` variables in **Vercel → Settings → Environment Variables**
4. Deploy!

---

## 📄 License

MIT © Waqas Chohan
