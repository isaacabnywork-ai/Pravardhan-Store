import React from 'react';
import { notFound } from 'next/navigation';
import { StoreService } from '@/services/storeService';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await StoreService.getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | Pravdhan Store' };

  return {
    title: `${product.name} (${product.weight}) - Buy Online at ₹${product.price} | Pravdhan Store`,
    description: `Order ${product.name} at ₹${product.price} (MRP ₹${product.mrp}). Fresh local grocery delivery with same-day and scheduled slots in Lucknow.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await StoreService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await StoreService.getRelatedProducts(product.id, product.categoryId);

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
