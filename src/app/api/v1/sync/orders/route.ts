import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import fs from 'fs';
import path from 'path';

// Shared persistence file for cross-device real-time sync (PC Admin <-> Mobile Phone)
const SYNC_FILE_PATH = path.join(process.cwd(), '.runtime_orders_sync.json');

function readSyncOrders(): any[] {
  try {
    if (fs.existsSync(SYNC_FILE_PATH)) {
      const content = fs.readFileSync(SYNC_FILE_PATH, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Failed reading sync orders file:', err);
  }
  return [];
}

function writeSyncOrders(orders: any[]) {
  try {
    fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing sync orders file:', err);
  }
}

// GET: Returns all live synchronized orders
export async function GET() {
  try {
    const orders = readSyncOrders();
    return apiSuccess({
      orders,
      updatedAt: new Date().toISOString(),
      timestamp: Date.now(),
    });
  } catch (error) {
    return apiError(error);
  }
}

// POST: Upsert an order or batch of orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = readSyncOrders();

    if (body.order) {
      const target = body.order;
      const index = existing.findIndex((o) => o.id === target.id);
      if (index >= 0) {
        existing[index] = { ...existing[index], ...target, updatedAt: new Date().toISOString() };
      } else {
        existing.unshift(target);
      }
      writeSyncOrders(existing);
      return apiSuccess({ success: true, order: target });
    }

    if (Array.isArray(body.orders)) {
      const map = new Map<string, any>();
      // Keep existing first
      existing.forEach((o) => map.set(o.id, o));
      // Overwrite/insert incoming
      body.orders.forEach((o: any) => map.set(o.id, { ...(map.get(o.id) || {}), ...o }));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      writeSyncOrders(merged);
      return apiSuccess({ success: true, count: merged.length });
    }

    // Single status update helper
    if (body.orderId && body.status) {
      const order = existing.find((o) => o.id === body.orderId);
      if (order) {
        order.orderStatus = body.status;
        order.updatedAt = new Date().toISOString();
        if (body.note) {
          order.statusHistory = order.statusHistory || [];
          order.statusHistory.push({
            status: body.status,
            label: body.status,
            note: body.note,
            completed: true,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          });
        }
        writeSyncOrders(existing);
        return apiSuccess({ success: true, order });
      }
    }

    return apiSuccess({ success: true, orders: existing });
  } catch (error) {
    return apiError(error);
  }
}
