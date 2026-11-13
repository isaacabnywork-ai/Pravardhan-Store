import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN']);

    const recentJobs = await prisma.smsDeliveryJob.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phone: true,
        status: true,
        attempts: true,
        lastError: true,
        providerMsgId: true,
        createdAt: true,
      },
    });

    return apiSuccess({
      hasAuthKey: Boolean(process.env.MSG91_AUTH_KEY),
      hasTemplateId: Boolean(process.env.MSG91_TEMPLATE_ID),
      templateIdSnippet: process.env.MSG91_TEMPLATE_ID ? `${process.env.MSG91_TEMPLATE_ID.slice(0, 4)}...` : null,
      recentJobs,
    });
  } catch (err) {
    return apiError(err);
  }
}
