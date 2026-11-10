# BATCH 10 OBSERVABILITY REPORT
## System Diagnostics, Telemetry & Operational Alert Specifications

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-10-production-readiness`  
**Date:** November 10, 2026

---

### 1. Production Diagnostics Visibility

The `/api/v1/admin/diagnostics` endpoint (protected under `SUPER_ADMIN` role) reports real-time readiness across critical platform dependencies:

1. **Neon PostgreSQL:** Reports connection state and connection pooling readiness.
2. **Razorpay Payment Gateway:** Reports presence of API credentials and webhook signing secret.
3. **MSG91 OTP Provider:** Reports API key and approved DLT template registration.
4. **AWS S3 Object Storage:** Reports S3 bucket, region, and IAM access configuration.
5. **Refund Webhook Health:** Monitors Razorpay refund event ingestion and payment reconciliation.
6. **Zero Plaintext Secret Exposure:** All credentials are sanitized; only boolean statuses and error descriptions are returned.

---

### 2. Actionable Production Alerting Rules

| Alert Condition | Metric / Log Trigger | Severity | Action Required |
| :--- | :--- | :--- | :--- |
| **Webhook Signature Mismatch** | `❌ Invalid Razorpay webhook signature` | High | Investigate potential replay attack or secret desync |
| **Over-Allocation Checkout** | `Financial integrity violation: Net applied...` | Medium | Audit order tender split logic |
| **Failed Cash Settlement** | `CashCollectionStatus.SHORT_COLLECTED` | Medium | Notify store manager for rider cash audit |
| **Refund Failure at Gateway** | `RefundStatus.FAILED` event received | High | Review merchant balance and retry refund |
| **Database Connection Failure** | Neon connection timeout | Critical | Inspect Neon endpoint status and connection pool limits |
