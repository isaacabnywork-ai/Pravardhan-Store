# PRAVDHAN STORE — BATCH 9.2 SECURITY REVIEW
**Production Hardening & Access Control Remediation**

- **Project:** Pravdhan Store
- **Review Scope:** Authentication, Authorization, Financial Record Integrity, Credential Handling, Fail-Closed Guards
- **Date:** 2026-11-10
- **Auditor:** Automated Hardening & Verification Suite

---

## 1. Security Architecture Summary

Batch 9.2 closes key vulnerability vectors identified during the independent acceptance audit:
1. **Preventing Financial Ledger Tampering / Cascade Dropping**: Changed relation constraint to `onDelete: Restrict`.
2. **Eliminating Rider IDOR Vulnerabilities**: Delivery staff cannot submit collections under other rider IDs.
3. **Fail-Closed External Integrations**: Production environments fail closed when external providers (MSG91, AWS S3 / Cloudinary) are unconfigured, preventing mock credentials or fallback OTPs from bypassing security controls.
4. **Race-Condition & Replay Mitigation**: Atomic database transactions and single unique order constraints enforce idempotent operations on physical cash ledgers.

---

## 2. In-Depth Security Assessment

### 2.1 CashCollection Ledger Immutability & Referential Integrity
- **Vulnerability Addressed:** Accidental or malicious deletion of an `Order` could purge corresponding physical cash receipt records if `onDelete: Cascade` remained active.
- **Resolution:**
  - Foreign key constraint updated to `ON DELETE RESTRICT`. A deletion query against an `Order` with an associated `CashCollection` will be rejected at the PostgreSQL database level.
  - Unique constraint `cash_collections_orderId_key` guarantees that an order cannot be associated with multiple collection records, closing duplicate collection vectors.
  - In code, once `settlementStatus` transitions to `SETTLED`, mutations are rejected by the service layer, preventing retroactive balance altering.

### 2.2 Rider Authorization & IDOR Protection
- **Vulnerability Addressed:** A rider could pass an arbitrary `riderId` in POST `/api/v1/admin/cash-collections` to record cash collection under another rider's profile.
- **Resolution:**
  - Added role-based check in `src/app/api/v1/admin/cash-collections/route.ts`:
  ```typescript
  if (session.user.role === 'DELIVERY_STAFF' && validated.riderId !== session.userId) {
    return NextResponse.json(
      { error: 'Forbidden: Delivery staff can only record cash collections for themselves' },
      { status: 403 }
    );
  }
  ```
  - Store management and Administrators retain operational capabilities to record collections on behalf of riders when handling in-person reconciliations.

### 2.3 Production SMS & OTP Fail-Closed Policy
- **Vulnerability Addressed:** Fallback development codes (e.g. `123456`) could potentially be utilized if MSG91 was unconfigured in production.
- **Resolution:**
  - `src/lib/services/sms.ts` executes a fast fail-closed guard before generating challenge records or dispatching SMS:
  ```typescript
  if (!this.isConfigured && !isDev) {
    throw new ValidationError('SMS service is currently unavailable. Please contact customer support.');
  }
  ```
  - Local OTP bypasses and development codes are strictly limited to `NODE_ENV !== 'production'`.

### 2.4 Storage Provider & POD Security
- **Vulnerability Addressed:** Unconfigured production storage allowing unverified upload paths or leaking sensitive configuration in diagnostics.
- **Resolution:**
  - In `src/lib/services/storage.ts`, requests to generate presigned upload signatures throw immediately if S3 or Cloudinary credentials are missing in production.
  - Upload file size is strictly capped at 5 MB with whitelisted MIME types (`image/jpeg`, `image/png`, `image/webp`).
  - Storage diagnostics in `diagnosticsService` redact all secrets and access keys.

---

## 3. Residual Risk & Pre-Launch Recommendations

1. **Production Credential Verification:** Ensure `POSTGRES_PRISMA_URL`, `MSG91_AUTH_KEY`, `RAZORPAY_KEY_SECRET`, and `AWS_ACCESS_KEY_ID` are provisioned in Vercel environment variables prior to traffic routing.
2. **Audit Logging:** Maintain persistent operational audit logs for all administrative cash settlement discrepancies.
