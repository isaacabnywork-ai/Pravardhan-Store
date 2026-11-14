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
            } else if (parsed.type === 'WALLET_UPDATE') {
              const targetPhoneClean = (parsed.customerPhone || parsed.customerId || '').replace(/\D/g, '').slice(-10);
              const targetId = parsed.customerId;

              let found = false;
              // Find matching customer by id or phone
              for (const [k, cust] of customerMap.entries()) {
                const custPhoneClean = (cust.phone || '').replace(/\D/g, '').slice(-10);
                if (
                  cust.id === targetId ||
                  (targetPhoneClean.length >= 10 && custPhoneClean === targetPhoneClean) ||
                  cust.phone === targetId
                ) {
                  cust.walletBalance = parsed.walletBalance;
                  if (parsed.transaction) {
                    cust.walletHistory = [parsed.transaction, ...(cust.walletHistory || [])];
                  }
                  cust.updatedAt = new Date().toISOString();
                  customerMap.set(k, cust);
                  found = true;
                }
              }

              // If customer wasn't registered yet, record it with their balance!
              if (!found && (targetId || targetPhoneClean)) {
                const newProfile = {
                  id: targetId || `cust-${targetPhoneClean}`,
                  name: parsed.customerName || (targetPhoneClean ? `Customer ${targetPhoneClean.slice(-4)}` : 'Customer'),
                  phone: targetPhoneClean || parsed.customerPhone || '',
                  role: 'CUSTOMER',
                  walletBalance: parsed.walletBalance || 0,
                  totalSpent: 0,
                  orderCount: 1,
                  status: 'ACTIVE',
                  addresses: [],
                  walletHistory: parsed.transaction ? [parsed.transaction] : [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                const newKey = targetPhoneClean || targetId;
                customerMap.set(newKey, newProfile);
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
      const targetPhoneClean = (body.customerPhone || body.customerId || '').replace(/\D/g, '').slice(-10);
      const targetId = body.customerId;

      let found = false;
      for (let i = 0; i < memoryCustomers.length; i++) {
        const c = memoryCustomers[i];
        const custPhoneClean = (c.phone || '').replace(/\D/g, '').slice(-10);
        if (
          c.id === targetId ||
          (targetPhoneClean.length >= 10 && custPhoneClean === targetPhoneClean) ||
          c.phone === targetId
        ) {
          c.walletBalance = body.walletBalance;
          if (body.transaction) {
            c.walletHistory = [body.transaction, ...(c.walletHistory || [])];
          }
          c.updatedAt = new Date().toISOString();
          memoryCustomers[i] = c;
          found = true;
          break;
        }
      }

      if (!found && (targetId || targetPhoneClean)) {
        memoryCustomers.unshift({
          id: targetId || `cust-${targetPhoneClean}`,
          name: body.customerName || (targetPhoneClean ? `Customer ${targetPhoneClean.slice(-4)}` : 'Customer'),
          phone: targetPhoneClean || body.customerPhone || '',
          role: 'CUSTOMER',
          walletBalance: body.walletBalance,
          totalSpent: 0,
          orderCount: 1,
          status: 'ACTIVE',
          addresses: [],
          walletHistory: body.transaction ? [body.transaction] : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await fetch(BUS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WALLET_UPDATE',
          customerId: body.customerId,
          customerPhone: body.customerPhone,
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
