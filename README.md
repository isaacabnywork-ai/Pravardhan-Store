# Pravdhan Store (Prabhandhan Store) — V1 Web Application

A modern local grocery & household e-commerce platform designed for a physical retail store and warehouse. Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Highlights & Architecture

### 1. Single-Store Direct-to-Customer Model (Spec §2)
* **Zero 3rd-party marketplace sellers**: The store itself owns and manages the inventory.
* Initial service area: **Sector 14 & Model Town, Zone 1, Gurugram**.

### 2. Multi-Variant Product Architecture (Spec §4 & §14)
* Products and variants are distinct entities:
  * **Product**: General concept (e.g. *Aashirvaad Superior MP Shudh Chakki Atta*).
  * **Variant**: Purchasable configuration (e.g. *1 KG*, *5 KG*, *10 KG*) with independent SKU, MRP, Selling Price, and real-time Stock.
* Customers can switch variants on product cards and product detail pages, with instant price, discount, and stock recalculation.

### 3. Delivery Model & Slots (Spec §6 & §7)
* **Same-Day Delivery & Scheduled Delivery**:
  * Today: `12:00 PM – 2:00 PM`, `2:00 PM – 4:00 PM`, `5:00 PM – 7:00 PM`, `7:00 PM – 9:00 PM`
  * Tomorrow: `7:00 AM – 9:00 AM`, `9:00 AM – 11:00 AM`, `11:00 AM – 1:00 PM`, `4:00 PM – 6:00 PM`
* **Configurable Delivery Charge**: Initially set to **₹0 Delivery Fee**, customizable in Store Settings.

### 4. Minimum Order Value Constraint (Spec §8)
* Configured to **₹100 Minimum Order** (in Store Settings).
* Visual alert progress bar in the Cart Drawer, Cart Page, and Checkout.
* Checkout is blocked if `cart_total < ₹100`, providing clear user guidance.

### 5. Authentication & Phone + OTP (Spec §9 & §10)
* Phone Number + OTP modal flow.
* Pre-filled demo OTP `123456` for rapid reviewer testing.
* Customer profile with multiple saved addresses (`Home`, `Office`, `Other`).

### 6. Five Distinct Roles (RBAC) (Spec §15)
An interactive **Role Switcher** is accessible at the top header and navigation menu:
1. **Customer**: Browse catalog, filter variants, manage cart, checkout, apply coupons, track live order status timeline.
2. **Product Manager**: Maintain products, variants, SKUs, pricing, stock levels, and category mappings.
3. **Order Manager**: Receive incoming orders, confirm inventory, oversee picking and packing, handover to riders, and handle cancellations.
4. **Delivery Staff**: View assigned orders, customer addresses, phone numbers, and mark orders *Out for Delivery* or *Delivered*.
5. **Super Admin**: Complete platform control: Analytics, Store Settings (Min Order, Delivery Fee), Promotions, Inventory, and User Roles.

### 7. Real-Time Inventory & Immutable Audit Trail (Spec §13)
* Variant-level stock tracking (`Available Stock`, `Reserved Stock`, `Available to Sell`).
* Audit trail logging timestamp, delta quantity, previous stock, new stock, reason, and operator.

### 8. Order Status Tracking Timeline (Spec §17 & §42)
* Live step-by-step progress tracking:
  `ORDER PLACED` ➜ `ORDER CONFIRMED` ➜ `BEING PREPARED` ➜ `READY FOR DELIVERY` ➜ `OUT_FOR_DELIVERY` ➜ `DELIVERED`
* Historical purchase prices and MRPs are locked at the time of purchase.

### 9. Indian Payment Gateways & Promotions (Spec §11 & §12)
* Support for **UPI** (Google Pay, PhonePe, Paytm, BHIM), **Credit/Debit Cards**, and **Cash on Delivery**.
* Coupon engine with promo codes: `WELCOME100`, `PRAVDHAN50`, `FESTIVE15`, `FREESHIP`.

---

## 🚀 Running the Application Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Production build & start**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Routes Overview

### Customer Storefront
* `/`: Homepage with promotional banners, categories, and deals.
* `/shop`: Catalog with category/subcategory filters, brand filter, and sorting.
* `/deals`: Daily savings club and coupon codes with 1-click apply.
* `/product/[slug]`: Product details, multi-variant selectors, stock indicators, and nutrition info.
* `/cart`: Full cart page with bill summary and minimum order progress bar.
* `/checkout`: 4-step streamlined checkout (Address ➜ Slot ➜ Payment ➜ Confirm).
* `/account`: Profile and saved addresses manager.
* `/account/orders`: Past and ongoing orders.
* `/account/orders/[id]`: Live vertical status timeline and tax invoice.

### Back-Office Admin Desk
* `/admin`: Overview KPIs (Revenue, Active Orders, Low Stock, Catalog SKUs).
* `/admin/products`: Product and variant manager (create/edit products, SKUs, prices, stock).
* `/admin/inventory`: Live inventory manager with stock adjustment modal and immutable audit history.
* `/admin/orders`: Order fulfillment workflow with picking checklist and status controls.
* `/admin/delivery`: Delivery executive field view with assigned stops and slot capacity tracker.
* `/admin/promotions`: Promotional campaigns and coupon code creator.
* `/admin/settings`: Store configuration (Minimum order value ₹100, Delivery charge ₹0, store hours).
