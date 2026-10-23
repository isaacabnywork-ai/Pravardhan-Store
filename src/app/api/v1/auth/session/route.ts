import { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { apiSuccess } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return apiSuccess({
      authenticated: false,
      user: null,
    });
  }

  return apiSuccess({
    authenticated: true,
    user: {
      id: session.userId,
      role: session.role,
      name: session.name,
      phone: session.phone,
      email: session.email,
      storeId: session.storeId,
    },
  });
}
