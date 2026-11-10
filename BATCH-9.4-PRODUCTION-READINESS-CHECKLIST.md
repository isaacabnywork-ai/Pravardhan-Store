# PRAVDHAN STORE — BATCH 9.4 PRODUCTION READINESS CHECKLIST
**Final Pre-Deployment Verification Matrix**

- **Project:** Pravdhan Store
- **Production URL:** `https://pravdhan-store.vercel.app`
- **Branch:** `feature/batch-9-production-hardening`
- **Final Target Commit:** Batch 9.4 Final Remediation
- **Final Status:** READY FOR FINAL INDEPENDENT ACCEPTANCE

---

## 1. Compliance Matrix

| Component | Invariant / Requirement | Verified Status |
| :--- | :--- | :---: |
| **COND-9.3-01 Migration** | Additive migration `20261110_batch9_4_cash_collection_remediation.sql` with pre-flight duplicate check, constraint replacement to `RESTRICT`, and unique index. | ✅ RESOLVED |
| **COND-9.3-02 Rule A** | Delivered COD orders never count as collected revenue without verified `CashCollection` (`collectedAmount > 0`). | ✅ ENFORCED |
| **COND-9.3-02 Rule B** | Every new COD checkout creates an atomic `CashCollection` entry in `PENDING` state with `collectedAmount: 0`. | ✅ ENFORCED |
| **COND-9.3-02 Rule C** | Physical collection uses authorized `recordCollection` with discrepancy handling and integer paise math. | ✅ ENFORCED |
| **COND-9.3-02 Rule D** | Historical COD orders lacking ledgers are classified as unverified legacy in analytics; backfill utility available. | ✅ ENFORCED |
| **COND-9.3-02 Rule E** | Zero double-counting of wallet debits, online gateway captures, and physical cash. | ✅ ENFORCED |
| **Lifecycle Integration** | Rider assignment updates `CashCollection.riderId`. Order cancellation marks uncollected ledger entries `FAILED`. | ✅ ENFORCED |
| **Security & Auth** | Rider IDOR protection: `DELIVERY_STAFF` cannot record collections under another rider's ID. | ✅ ENFORCED |
| **External Fail-Closed**| Production SMS (MSG91) and Storage (AWS S3) fail closed if unconfigured. Demo OTP blocked in prod. | ✅ ENFORCED |
| **Frontend Design Freeze**| Absolute 0 changes to storefront UI, styles, or customer JSX components. | ✅ 100% FROZEN |
| **Build & Test Suite** | 18/18 tests pass across 4 suites. TypeScript, ESLint, and Next.js production build pass cleanly. | ✅ VERIFIED |

---

## 2. Pre-Deployment Operational Directives

1. **Database Migration Execution:**
   - Execute `npx prisma migrate deploy` or apply `prisma/migrations/20261110_batch9_4_cash_collection_remediation.sql` to Neon PostgreSQL.
2. **Environment Variables on Vercel:**
   - `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
   - `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`
   - `STORAGE_PROVIDER=S3`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
3. **Optional Historical Backfill:**
   - If historical COD orders from prior development batches need ledger placeholders, trigger `cashCollectionService.backfillHistoricalCodOrders()`.

---

## 3. Final Sign-Off

Batch 9.4 has completely resolved all outstanding conditions from Batch 9.3. The repository is in a clean, consistent, fully verified state.

**Status:** READY FOR FINAL INDEPENDENT ACCEPTANCE
