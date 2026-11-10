# BATCH 9 MIGRATION REVIEW: CASH COLLECTION & FINANCIAL LEDGER

- **Migration Script:** `prisma/migrations/20261110_batch9_cash_collection.sql`
- **Scope:** Additive schema additions for Rider Cash Collection & Reconciliation
- **Safety Rating:** **100% Non-destructive / Zero Data Loss**

---

## 1. Schema Additions

1. **`CashCollectionStatus` Enum:**
   - Values: `PENDING`, `COLLECTED`, `SHORT_COLLECTED`, `EXCESS_COLLECTED`, `FAILED`
2. **`SettlementStatus` Enum:**
   - Values: `UNSETTLED`, `SETTLED`, `DISCREPANCY`
3. **`cash_collections` Table:**
   - Primary key: `id` (CUID)
   - Relations: `orderId` -> `Order.id` (CASCADE), `riderId` -> `User.id` (RESTRICT)
   - Store scoping: `storeId` with dedicated index
   - Granular indexes: `orderId`, `riderId`, `storeId`, `collectionStatus`, `settlementStatus`

---

## 2. Safety & Backward Compatibility Analysis

- **No existing tables or columns are removed or altered.**
- **Existing `Order`, `Payment`, and `DeliveryAssignment` records remain untouched.**
- **Nullable / Default Values:** All new fields either carry explicit defaults (`collectedAmount = 0`, `collectionStatus = PENDING`, `settlementStatus = UNSETTLED`) or are nullable (`collectedAt`, `settledAt`, `notes`).
- **Rollback Procedure:**
  ```sql
  DROP TABLE IF EXISTS "cash_collections";
  DROP TYPE IF EXISTS "SettlementStatus";
  DROP TYPE IF EXISTS "CashCollectionStatus";
  ```
