# BATCH 10.1 SECURITY AND CONFIGURATION REVIEW
## Production Environment Validation, Secret Protection & Access Controls

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-10-production-readiness`  
**Audited Commit:** `8edc2cddf84a7257931e591a12b31e8fbfb84ac2`  
**Starting Baseline:** `f69bcf3566be23591529c37597ba1fdd33bb313b`  
**Audit Mode:** STRICT READ-ONLY INDEPENDENT AUDIT  
**Date:** November 12, 2026  

---

### 1. Environment Configuration Audit (`src/lib/validation/env.ts`)

#### A. Production Fail-Closed Rules
1. **Critical Secret Validation:**
   In `src/lib/validation/env.ts`:
   ```typescript
   if (result.data.NODE_ENV === 'production' && !isBuildPhase) {
     if (result.data.AUTH_SECRET === 'pravdhan-store-dev-secret-32-chars-long-minimum') {
       throw new Error('Production security violation: AUTH_SECRET cannot use insecure development default value.');
     }
   }
   ```
   If `NODE_ENV === 'production'`, the server verifies that `AUTH_SECRET` is not using the insecure fallback string.
2. **Build-Phase Isolation:**
   The check inspects `process.env.NEXT_PHASE === 'phase-production-build'` or `process.env.npm_lifecycle_event === 'build'`. During Next.js static asset compilation in CI/CD, build runs without failing on placeholder env variables, while runtime requests strictly enforce real production secrets.
3. **Observation on Optional Variables:**
   - In `serverEnvSchema`, external service keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `MSG91_AUTH_KEY`, `CLOUDINARY_CLOUD_NAME`) are defined with `.optional()`.
   - **Audit Assessment:** The application relies on service-layer fail-closed checks rather than schema-level rejection on startup. For instance, `SMS` dispatch checks `if (!env.MSG91_AUTH_KEY)` and throws or reports unconfigured, and Razorpay payment generation fails closed if keys are missing. This allows staging/local testing without mandatory mock credentials for all third-party providers.

---

### 2. Webhook Security (`src/app/api/v1/webhooks/razorpay/route.ts`)

1. **HMAC-SHA256 Signature Verification:**
   ```typescript
   if (env.RAZORPAY_WEBHOOK_SECRET && signature) {
     const expectedSignature = crypto
       .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
       .update(rawBody)
       .digest('hex');

     if (expectedSignature !== signature) {
       console.error('❌ Invalid Razorpay webhook signature');
       return apiError(new Error('Invalid signature'));
     }
   }
   ```
2. **Security Vulnerability / Finding (`SEC-10.1-01` — MEDIUM):**
   - If `env.RAZORPAY_WEBHOOK_SECRET` is **not configured** or if the incoming request omits the `x-razorpay-signature` header, the code currently skips verification and proceeds to process the payload:
     `if (env.RAZORPAY_WEBHOOK_SECRET && signature) { ... }`
   - **Recommendation:** In production mode (`NODE_ENV === 'production'`), the webhook MUST fail closed and reject any webhook missing a valid signature or if `RAZORPAY_WEBHOOK_SECRET` is unset:
     ```typescript
     if (env.NODE_ENV === 'production' && (!env.RAZORPAY_WEBHOOK_SECRET || !signature)) {
       return new Response('Unauthorized: Webhook signature required', { status: 401 });
     }
     ```

---

### 3. Route Authorization & RBAC

1. **Admin Diagnostics (`/api/v1/admin/diagnostics`):**
   - Protected with `requireRole(request, ['SUPER_ADMIN'])`.
   - Does not expose secret strings, tokens, or database passwords in JSON responses.
2. **Rider Access & IDOR Guards:**
   - Rider routes verify `session.role === 'DELIVERY_STAFF'` and enforce assignment ownership (`riderId === session.userId`).
3. **Customer Isolation:**
   - Order cancellation and tracking routes enforce customer ownership:
     `if (!isStaff && userId && order.userId !== userId) throw new ForbiddenError(...)`.
