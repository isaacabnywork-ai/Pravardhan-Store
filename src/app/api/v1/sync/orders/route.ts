import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';

const BUS_TOPIC = 'pravdhan_orders_sync_live_bus_v1';
const BUS_URL = `https://ntfy.sh/${BUS_TOPIC}`;

// In-memory server cache as fast fallback
let memoryOrders: any[] = [];

// GET: Poll latest synchronized orders across PC and Phone
export async function GET() {
  try {
    // 1. Fetch recent messages from the cloud event bus
    const busRes = await fetch(`${BUS_URL}/json?poll=1&since=24h`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (busRes.ok) {
      const text = await busRes.text();
      const lines = text.trim().split('\n').filter(Boolean);

      const orderMap = new Map<string, any>();
      // Seed with memory cache
      memoryOrders.forEach((o) => orderMap.set(o.id, o));

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.message) {
            const parsed = JSON.parse(entry.message);
            if (parsed.type === 'ORDER_UPSERT' && parsed.order?.id) {
              const existing = orderMap.get(parsed.order.id);
              orderMap.set(parsed.order.id, { ...(existing || {}), ...parsed.order });
            } else if (parsed.type === 'STATUS_UPDATE' && parsed.orderId) {
              const existing = orderMap.get(parsed.orderId);
              if (existing) {
                existing.orderStatus = parsed.status;
                existing.updatedAt = new Date().toISOString();
                if (parsed.note) {
                  existing.statusHistory = existing.statusHistory || [];
                  existing.statusHistory.push({
                    status: parsed.status,
                    label: parsed.status,
                    note: parsed.note,
                    completed: true,
                    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  });
                }
              }
            }
          }
        } catch {
          // ignore unparsable entry
        }
      }

      memoryOrders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return apiSuccess({
      orders: memoryOrders,
      timestamp: Date.now(),
    });
  } catch (error) {
    return apiError(error);
  }
}

// POST: Broadcast order create / status change to cloud event bus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.order) {
      const target = body.order;
      // Update memory cache
      const idx = memoryOrders.findIndex((o) => o.id === target.id);
      if (idx >= 0) memoryOrders[idx] = { ...memoryOrders[idx], ...target };
      else memoryOrders.unshift(target);

      // Publish to cloud bus
      await fetch(BUS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ORDER_UPSERT',
          order: target,
          timestamp: Date.now(),
        }),
      }).catch(() => null);

      return apiSuccess({ success: true, order: target });
    }

    if (body.orderId && body.status) {
      const existing = memoryOrders.find((o) => o.id === body.orderId);
      if (existing) {
        existing.orderStatus = body.status;
        existing.updatedAt = new Date().toISOString();
      }

      await fetch(BUS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STATUS_UPDATE',
          orderId: body.orderId,
          status: body.status,
          note: body.note,
          timestamp: Date.now(),
        }),
      }).catch(() => null);

      return apiSuccess({ success: true, orderId: body.orderId, status: body.status });
    }

    return apiSuccess({ success: true, count: memoryOrders.length });
  } catch (error) {
    return apiError(error);
  }
}
