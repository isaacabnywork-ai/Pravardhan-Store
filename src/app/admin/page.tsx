import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Store Partner Admin | Pravardhan Store',
  description: 'Manage store catalog, stock, prices, orders, and delivery slots.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
