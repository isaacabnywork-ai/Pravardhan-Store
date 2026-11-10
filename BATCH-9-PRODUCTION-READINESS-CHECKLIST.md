# BATCH 9 PRODUCTION READINESS CHECKLIST

| Configuration Key | Category | Requirement | Production Readiness Status |
| :--- | :--- | :--- | :--- |
| `POSTGRES_PRISMA_URL` | Database | Neon pooled connection string | **CONFIGURED / REQUIRED** |
| `POSTGRES_URL_NON_POOLING` | Database | Direct connection for migrations | **CONFIGURED / REQUIRED** |
| `AUTH_SECRET` | Security | Minimum 32-character JWT secret | **CONFIGURED / REQUIRED** |
| `AUTH_URL` | Security | Production application domain | **CONFIGURED** |
| `RAZORPAY_KEY_ID` | Payment | Razorpay public key identifier | **CONFIGURED** |
| `RAZORPAY_KEY_SECRET` | Payment | Razorpay secret key | **CONFIGURED** |
| `RAZORPAY_WEBHOOK_SECRET` | Payment | Webhook signature verification key | **CONFIGURED** |
| `MSG91_AUTH_KEY` | SMS / OTP | SMS gateway authentication key | **NOT_CONFIGURED (Fallback active)** |
| `MSG91_TEMPLATE_ID` | SMS / OTP | DLT-approved OTP template ID | **NOT_CONFIGURED (Fallback active)** |
| `CLOUDINARY_CLOUD_NAME` | Storage | Object storage cloud bucket | **CONFIGURED** |
| `CLOUDINARY_API_KEY` | Storage | Object storage public API key | **CONFIGURED** |
| `CLOUDINARY_API_SECRET` | Storage | Object storage signing secret | **CONFIGURED** |
| `FIREBASE_PROJECT_ID` | Push Notifications | FCM project identifier | **NOT_CONFIGURED (Optional)** |

*Note: All secret values are excluded from documentation and diagnostics reports in accordance with production security standards.*
