# BATCH 10 PRODUCTION CONFIGURATION REPORT
## Environment Variables, Secrets & Production Fail-Closed Specifications

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-10-production-readiness`  
**Date:** November 10, 2026

---

### 1. Mandatory Production Environment Inventory

| Variable Name | Required | Category | Description | Fail-Closed Rule |
| :--- | :--- | :--- | :--- | :--- |
| `POSTGRES_PRISMA_URL` | YES | Database | Connection string with Neon pooling | App throws on startup if absent |
| `POSTGRES_URL_NON_POOLING` | YES | Database | Direct URL for migrations & schema operations | Required for schema operations |
| `AUTH_SECRET` | YES | Security | 32+ char secret for JWT session encryption | Rejects dev default in production |
| `AUTH_URL` | YES | Security | Canonical deployment URL (`https://pravdhan-store.vercel.app`) | Validates URL format |
| `RAZORPAY_KEY_ID` | YES | Payment | Live Razorpay merchant key ID | Disables online payment if absent |
| `RAZORPAY_KEY_SECRET` | YES | Payment | Live Razorpay merchant secret | Disables online payment if absent |
| `RAZORPAY_WEBHOOK_SECRET` | YES | Payment | Webhook HMAC verification secret | Rejects unverified webhook events |
| `MSG91_AUTH_KEY` | YES | SMS/OTP | Production MSG91 API key | Rejects deterministic mock OTP |
| `MSG91_TEMPLATE_ID` | YES | SMS/OTP | Approved DLT template identifier | Rejects deterministic mock OTP |
| `STORAGE_BUCKET` | YES | Storage | Production AWS S3 bucket name | Rejects local filesystem fallback |
| `STORAGE_API_KEY` | YES | Storage | Production AWS access key | Rejects local filesystem fallback |
| `STORAGE_API_SECRET` | YES | Storage | Production AWS secret key | Rejects local filesystem fallback |
| `CRON_SECRET` | YES | Operations | Bearer token for Vercel Cron jobs | Rejects unauthenticated triggers |

---

### 2. Runtime Integrity Safeguards

1. **No Insecure Secret Defaults:** Default dev credentials are automatically detected and blocked in production mode.
2. **Deterministic Mock Disablement:** Test phone numbers and mock OTPs (`123456`) are strictly disabled in production runtime.
3. **Storage Security:** In production mode, local disk storage fallback is prohibited; proof of delivery uploads require verified S3 signatures.
