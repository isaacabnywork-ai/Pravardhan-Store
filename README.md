# 🛒 Pravdhan Store — Modern Local Grocery E-Commerce Platform

A production-quality, high-performance grocery web application engineered for real neighborhood grocery stores. Features the visual polish, high information density, and fluid UX of modern Indian quick-commerce applications, tailored specifically for **normal local delivery** with scheduled delivery slots and same-day delivery.

---

## 🌟 Key Highlights & Business Model

- **Real Local Grocery Model**: Configurable scheduled slots (e.g. *Today 4 PM – 6 PM*, *Tomorrow 10 AM – 12 PM*), same-day delivery, and store pickup. No false 10-minute promises.
- **Visual Polish**: Crisp white cards, high information density, MRP strike-throughs, discount badges, stock indicators (*"4 left"*), and animated inline quantity controls `[ ADD ]` &rarr; `[-] 1 [+]` without navigation away from the browse screen.
- **Performance First**: Built with Next.js Server Components for static catalog and SEO pages, with selective Client Components strictly for interactive controls.
- **PWA & Android APK Ready**: Includes PWA manifest, service worker offline shell caching, safe-area insets (`env(safe-area-inset-bottom)`), and Capacitor configuration ready to compile into a native Android APK.
- **Dual Data Mode**: Runs out-of-the-box with rich realistic Indian grocery mock data, and connects seamlessly to Supabase PostgreSQL with pre-written schema and RLS policies.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router, Server Components) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS with custom Indian grocery design tokens |
| **Icons** | Lucide React |
| **Backend & DB** | PostgreSQL via Supabase (Row Level Security, 24 normalized tables) |
| **Payments** | Razorpay Server Abstraction (UPI, Cards, NetBanking, COD) |
| **Mobile / Hybrid** | Progressive Web App (PWA) + Capacitor ready for Android APK |

---

## 📱 Page & URL Structure

```
/                         # Homepage with location selector, categories, banners, curated sections
/categories               # Full category index
/categories/[slug]        # Category browsing with subcategory pills, sort sheet, and 2-col product grid
/products/[slug]          # Product details, image gallery, pack variant selector, sticky bottom bar
/search                   # Debounced live search with trending tags and recent history
/cart                     # Cart view with free delivery meter, slot picker, coupons, and bill details
/checkout                 # Streamlined checkout with saved addresses, instructions, and payment methods
/orders                   # Customer order history with 1-click "Order Again"
/orders/[id]              # Live milestone order tracker (Placed -> Confirmed -> Packing -> Out for Delivery -> Delivered)
/account                  # Customer profile, OTP authentication modal, addresses
/account/wishlist         # Saved favorite grocery items
/admin                    # Partner dashboard: Revenue KPI, Inventory Adjuster, Order Status Manager, Store Settings
```

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone <repo-url>
cd "c:/E Com app"

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Running Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) on your desktop or mobile browser.

### 4. Production Build

```bash
npm run build
npm run start
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

A complete, normalized schema is located in `supabase/schema.sql` featuring:
- **24 normalized tables**: `profiles`, `addresses`, `categories`, `subcategories`, `brands`, `products`, `product_variants`, `product_images`, `inventory`, `inventory_transactions`, `carts`, `cart_items`, `wishlists`, `orders`, `order_items`, `payments`, `coupons`, `delivery_slots`, etc.
- **Indexes** on all primary query targets (`slug`, `category_id`, `sku`, `status`, `created_at`).
- **Row Level Security (RLS)** policies safeguarding customer orders and addresses.

To deploy to your Supabase project:
1. Open your Supabase Dashboard &rarr; **SQL Editor**.
2. Paste the contents of `supabase/schema.sql` and run.
3. Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

---

## 📲 Packaging into an Android APK (Capacitor)

The codebase has been built mobile-first with touch-friendly targets, no hover dependency, and safe-area insets.

To export as an Android application:

1. **Install Capacitor CLI & Android platform**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init "Aapka Kirana" "in.aapkakirana.app" --web-dir=out
   ```

3. **Build Static Export**:
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   ```

4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
   In Android Studio, select **Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK**.

---

## 💳 Payment Integration (Razorpay)

Payment handling is abstracted in `src/lib/payments/razorpay.ts`:
- Server-side order creation (`PaymentService.createOrder`) converts rupee amounts to paise.
- Signature verification (`PaymentService.verifyPaymentSignature`) validates HMAC SHA256 signatures before confirming orders.
- Webhook listener verifies `X-Razorpay-Signature` to protect against tampering.
- Cash on Delivery (COD) is supported out of the box.

---

## 🛡️ License

Built for real-world commercial local grocery delivery operations.
