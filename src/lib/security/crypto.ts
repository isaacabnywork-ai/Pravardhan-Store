import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16; // Standard 128-bit authentication tag

export const CURRENT_KEY_VERSION = 'v1';

/**
 * Validates and retrieves the 32-byte key Buffer for a specified key version.
 * Supports multi-version key rotation.
 * In production, strictly fails closed if key is missing or not 32 bytes (64 hex characters or 32 raw bytes).
 */
export function getKeyForVersion(version: string = CURRENT_KEY_VERSION): Buffer {
  let rawKey: string | undefined;

  if (version === 'v1') {
    rawKey = process.env.OTP_ENCRYPTION_KEY_V1 || process.env.OTP_ENCRYPTION_KEY;
  } else {
    rawKey = process.env[`OTP_ENCRYPTION_KEY_${version.toUpperCase()}`];
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (!rawKey) {
    if (isProduction || version !== 'v1') {
      throw new Error(`Production Security Violation: Missing dedicated OTP encryption key for version ${version}`);
    }
    // Safe deterministic development-only fallback key strictly for default v1 in non-production
    rawKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }

  // If hex-encoded (64 chars), decode to 32 bytes Buffer
  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  // If 32 raw characters, convert directly
  if (Buffer.byteLength(rawKey, 'utf8') === 32) {
    return Buffer.from(rawKey, 'utf8');
  }

  throw new Error(`Invalid OTP encryption key for ${version}: Key must be exactly 32 bytes (or 64 hex characters)`);
}

/**
 * Encrypts sensitive string payload (e.g. OTP code) using authenticated AES-256-GCM.
 * Formats output as: "version:iv:authTag:ciphertext" in hex.
 */
export function encryptPayload(plaintext: string, version: string = CURRENT_KEY_VERSION): string {
  const key = getKeyForVersion(version);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `${version}:${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypts authenticated AES-256-GCM payload with version-aware key resolution.
 * Strictly throws if tampering, invalid key, missing key version, or corrupt ciphertext occurs.
 */
export function decryptPayload(payload: string): string {
  const parts = payload.split(':');

  let version: string;
  let ivHex: string;
  let authTagHex: string;
  let encryptedHex: string;

  if (parts.length === 4) {
    [version, ivHex, authTagHex, encryptedHex] = parts;
  } else if (parts.length === 3) {
    // Backward compatibility with unversioned legacy payload
    version = 'v1';
    [ivHex, authTagHex, encryptedHex] = parts;
  } else {
    throw new Error('Invalid encrypted payload structure');
  }

  const key = getKeyForVersion(version);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error('Invalid IV length for AES-GCM');
  }

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid authentication tag length');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
