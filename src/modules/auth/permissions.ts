import { Role } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getSessionFromRequest, SessionPayload } from '@/lib/auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';

export type Permission =
  | 'catalog:read'
  | 'catalog:write'
  | 'inventory:read'
  | 'inventory:adjust'
  | 'orders:read_all'
  | 'orders:read_store'
  | 'orders:fulfill'
  | 'orders:dispatch'
  | 'orders:deliver'
  | 'staff:manage'
  | 'settings:manage'
  | 'promotions:manage'
  | 'reports:view';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'catalog:read',
    'catalog:write',
    'inventory:read',
    'inventory:adjust',
    'orders:read_all',
    'orders:read_store',
    'orders:fulfill',
    'orders:dispatch',
    'orders:deliver',
    'staff:manage',
    'settings:manage',
    'promotions:manage',
    'reports:view',
  ],
  PRODUCT_MANAGER: [
    'catalog:read',
    'catalog:write',
    'inventory:read',
    'inventory:adjust',
    'promotions:manage',
  ],
  ORDER_MANAGER: [
    'catalog:read',
    'orders:read_all',
    'orders:read_store',
    'orders:dispatch',
    'reports:view',
  ],
  STORE_MANAGER: [
    'catalog:read',
    'inventory:read',
    'inventory:adjust',
    'orders:read_store',
    'orders:fulfill',
  ],
  DELIVERY_STAFF: [
    'catalog:read',
    'orders:deliver',
  ],
  CUSTOMER: [
    'catalog:read',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Enforces that a valid session exists on the request
 */
export async function requireAuth(request: NextRequest): Promise<SessionPayload> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw new UnauthorizedError('Authentication required to access this resource');
  }
  return session;
}

/**
 * Enforces that the authenticated user possesses one of the allowed roles
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: Role[]
): Promise<SessionPayload> {
  const session = await requireAuth(request);
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError(`Role ${session.role} is not permitted to perform this action`);
  }
  return session;
}

/**
 * Enforces that the user has a specific granular permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<SessionPayload> {
  const session = await requireAuth(request);
  if (!hasPermission(session.role, permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
  return session;
}

/**
 * Validates store scope for store-scoped staff (Store Managers, Fulfillment)
 */
export function validateStoreScope(session: SessionPayload, targetStoreId: string): void {
  // Super Admin can access all stores
  if (session.role === 'SUPER_ADMIN') {
    return;
  }

  // If user has a designated storeId, it must match
  if (session.storeId && session.storeId !== targetStoreId) {
    throw new ForbiddenError('Access denied: You do not have permission for this store location');
  }
}
