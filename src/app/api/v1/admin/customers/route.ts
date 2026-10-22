import { NextRequest } from 'next/server';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN', 'ORDER_MANAGER']);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';

    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            label: true,
            houseNumber: true,
            street: true,
            area: true,
            city: true,
            pincode: true,
            isDefault: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            orderStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const mapped = customers.map((c) => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        role: c.role,
        isActive: c.isActive,
        createdAt: c.createdAt,
        addresses: c.addresses,
        orderCount: c.orders.length,
        totalSpentPaise: totalSpent,
        totalSpentRupees: totalSpent / 100,
        lastOrder: c.orders[0] || null,
      };
    });

    return apiSuccess(mapped);
  } catch (error) {
    return apiError(error);
  }
}
