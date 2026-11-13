import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const INITIAL_ADMIN_EMAILS = [
  'abnyweb1@gmail.com',
  'isaackhatri@gmail.com',
  'contactabny@gmail.com',
  'admin@pravdhanstore.in',
];

export async function isEmailAuthorizedForAdmin(rawEmail: string): Promise<{ authorized: boolean; role: Role }> {
  const email = rawEmail.toLowerCase().trim();

  // 1. Check Hardcoded & Environment Whitelist
  const envEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);

  const whitelist = new Set([
    ...INITIAL_ADMIN_EMAILS.map((e) => e.toLowerCase()),
    ...envEmails,
  ]);

  if (whitelist.has(email)) {
    return { authorized: true, role: Role.SUPER_ADMIN };
  }

  // 2. Check Database for staff roles
  try {
    const existingUser = await prisma.user.findFirst({
      where: { email },
      select: { role: true, isActive: true },
    });

    if (existingUser && existingUser.isActive && existingUser.role !== Role.CUSTOMER) {
      return { authorized: true, role: existingUser.role };
    }
  } catch (err) {
    console.warn('Database error checking admin role:', err);
  }

  return { authorized: false, role: Role.CUSTOMER };
}
