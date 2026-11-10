# BATCH 9 SECURITY AUDIT REPORT

- **Application:** Pravdhan Store
- **Audit Date:** 2026-11-10
- **Auditor:** Independent Production Security Audit

---

## 1. Authentication & Session Security

- **JWT Session Verification:** All private and admin routes enforce `requireAuth` or `requireRole` with HMAC SHA-256 signed session tokens.
- **Cookie Security:** Auth session tokens are stored in `pravdhan_session_token` with `httpOnly: true`, `secure: true` in production, and `sameSite: 'lax'`.
- **OTP Security:**
  - 60-second cooldown per phone number.
  - Rate limited to maximum 4 requests per 10-minute window.
  - Max 5 failed attempts per OTP challenge before automatic invalidation.
  - OTPs hashed via SHA-256 before storage; no plaintext OTPs stored in database.

---

## 2. Store Scoping & Multi-Tenant Isolation

- **Cross-Store Access Prevention:** All admin and operational endpoints execute `validateStoreScope(session, requestedStoreId)`.
- **Finding:** A `STORE_MANAGER` or `DELIVERY_STAFF` cannot view or mutate another store's inventory, cash collection, or orders by manipulating `storeId` query parameters or JSON payloads. `SUPER_ADMIN` retains multi-store oversight.

---

## 3. Financial Invariants & Idempotency

- **Integer Arithmetic:** All monetary fields (`grandTotal`, `collectedAmount`, `wacUnitCost`, `price`) are represented in integer paise.
- **Double Counting Protection:** Webhook events verify HMAC signatures (`x-razorpay-signature`) and process idempotently based on `gatewayOrderId` and `gatewayPaymentId`.
- **COD Collection Hardening:** Delivered status does **not** assume collected revenue; cash collections are traced to dedicated `cash_collections` records.

---

## 4. Export & File Upload Protection

- **Formula Injection (DDE):** All CSV exports sanitize sensitive prefixes (`=`, `+`, `-`, `@`, `\t`, `\r`) by prepending a single quote (`'`).
- **Storage / Upload Protection:** Production POD uploads generate signed Cloudinary/S3 signatures server-side after validating folder scope and user role. Private storage credentials are never returned to the client.
