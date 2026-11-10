# BATCH 9.6 MIGRATION REVIEW
## Database Schema & Migration Invariant Analysis

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-9-production-hardening`  
**Date:** November 10, 2026

---

### 1. Existing Applied Migrations

The repository contains two applied SQL migration scripts for Batch 9:
1. `prisma/migrations/20261110_batch9_cash_collection.sql`: Initial schema creation for `CashCollection` table, enums, and indexes.
2. `prisma/migrations/20261110_batch9_4_cash_collection_remediation.sql`: Safe additive migration enforcing pre-flight duplicate validation and unique index on `orderId`.

### 2. Migration Discipline for Batch 9.6

- **Strict Read-Only Compliance:** Neither of the two historical migrations above was modified or altered.
- **No Schema Changes Required:** Both `Payment` and `CashCollection` tables already provide independent integer columns:
  - `Payment.amount` (`Int`, representing paise)
  - `CashCollection.expectedAmount` (`Int`, representing paise)
  - `CashCollection.collectedAmount` (`Int`, representing paise)
- **Multi-Tender Support:** Because `Order` has a 1-to-many relationship with `Payment` (`Order.payments Payment[]`), split payments (e.g. Wallet tender + COD tender) are represented as distinct `Payment` records linked by `orderId`. Net COD cash is recorded directly in `CashCollection.expectedAmount` without requiring new columns or tables.
- **Prisma Validation:** Running `npx prisma validate` confirms that the schema is completely valid and free of discrepancies.
