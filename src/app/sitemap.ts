import { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/data/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pravdhanstore.in';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = INITIAL_CATEGORIES.map((category) => ({
    url: `${baseUrl}/shop?category=${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = INITIAL_PRODUCTS.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
