import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16; // Standard 128-bit authentication tag

function getEncryptionKey(): Buffer {
  const secret = process.env.OTP_ENCRYPTION_KEY || process.env.AUTH_SECRET || 'pravdhan-store-otp-secret-key-32-bytes-min!!';
  // Derive deterministic 32-byte (256-bit) key using SHA-256
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive string payload (e.g. OTP code) using authenticated AES-256-GCM.
 * Formats output as: "iv:authTag:ciphertext" in hex.
 */
export function encryptPayload(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypts authenticated AES-256-GCM payload.
 * Strictly throws if tampering, invalid key, or corrupt ciphertext occurs.
 */
export function decryptPayload(payload: string): string {
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
