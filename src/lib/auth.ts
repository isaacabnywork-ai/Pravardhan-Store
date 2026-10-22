import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { Role } from '@prisma/client';
import { NextRequest } from 'next/server';
import { env } from './env';

const JWT_SECRET = new TextEncoder().encode(env.AUTH_SECRET);
const TOKEN_EXPIRY = '7d';
export const AUTH_COOKIE_NAME = 'pravdhan_session_token';

export interface SessionPayload {
  userId: string;
  role: Role;
  name: string;
  email?: string | null;
  phone?: string | null;
  storeId?: string | null;
}

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain text password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Issue a signed JWT session token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as Role,
      name: payload.name as string,
      email: payload.email as string | undefined,
      phone: payload.phone as string | undefined,
      storeId: payload.storeId as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Extract session from Authorization header or HTTP-only cookie
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  // Check Authorization Bearer header first (useful for mobile apps & API clients)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return verifySessionToken(token);
  }

  // Fallback to cookie
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (cookie?.value) {
    return verifySessionToken(cookie.value);
  }

  return null;
}
