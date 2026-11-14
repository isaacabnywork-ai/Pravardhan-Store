import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';

const BUS_TOPIC = 'pravdhan_customers_sync_live_bus_v1';
const BUS_URL = `https://ntfy.sh/${BUS_TOPIC}`;

// In-memory fallback
let memoryCustomers: any[] = [];

// GET: Fetch all registered customers polled from cloud event bus
export async function GET() {
  try {
    const busRes = await fetch(`${BUS_URL}/json?poll=1&since=72h`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (busRes.ok) {
      const text = await busRes.text();
      const lines = text.trim().split('\n').filter(Boolean);

      const customerMap = new Map<string, any>();
      memoryCustomers.forEach((c) => {
        const key = c.phone || c.email || c.id;
        customerMap.set(key, c);
      });

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.message) {
            const parsed = JSON.parse(entry.message);
            if (parsed.type === 'CUSTOMER_UPSERT' && parsed.customer) {
              const cust = parsed.customer;
              const key = cust.phone || cust.email || cust.id;
              const existing = customerMap.get(key);
              customerMap.set(key, { ...(existing || {}), ...cust });
            } else if (parsed.type === 'WALLET_UPDATE' && parsed.customerId) {
              // Find matching customer by id or phone
              for (const [k, cust] of customerMap.entries()) {
                if (cust.id === parsed.customerId || cust.phone === parsed.customerId) {
                  cust.walletBalance = parsed.walletBalance;
                  if (parsed.transaction) {
                    cust.walletHistory = [parsed.transaction, ...(cust.walletHistory || [])];
                  }
                  cust.updatedAt = new Date().toISOString();
                  customerMap.set(k, cust);
                  break;
                }
              }
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      memoryCustomers = Array.from(customerMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return apiSuccess({
      customers: memoryCustomers,
      timestamp: Date.now(),
    });
  } catch (error) {
    return apiError(error);
  }
}

// POST: Broadcast customer registration or wallet update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.customer) {
      const cust = body.customer;
      const key = cust.phone || cust.email || cust.id;
      const idx = memoryCustomers.findIndex((c) => (c.phone && c.phone === cust.phone) || (c.email && c.email === cust.email) || c.id === cust.id);
      if (idx >= 0) memoryCustomers[idx] = { ...memoryCustomers[idx], ...cust };
      else memoryCustomers.unshift(cust);

      await fetch(BUS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CUSTOMER_UPSERT',
          customer: cust,
          timestamp: Date.now(),
        }),
      }).catch(() => null);

      return apiSuccess({ success: true, customer: cust });
    }

    if (body.customerId && typeof body.walletBalance === 'number') {
      await fetch(BUS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WALLET_UPDATE',
          customerId: body.customerId,
          walletBalance: body.walletBalance,
          transaction: body.transaction,
          timestamp: Date.now(),
        }),
      }).catch(() => null);

      return apiSuccess({ success: true, customerId: body.customerId, walletBalance: body.walletBalance });
    }

    return apiSuccess({ success: true, count: memoryCustomers.length });
  } catch (error) {
    return apiError(error);
  }
}
