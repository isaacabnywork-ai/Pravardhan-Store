import React, { Suspense } from 'react';
import { SearchClient } from '@/components/search/SearchClient';

export const metadata = {
  title: 'Search Groceries | Pravardhan Store',
  description: 'Search fresh vegetables, fruits, dairy, atta, dal, and everyday grocery items from your local store.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-6 text-center text-slate-500">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
