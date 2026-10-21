import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pravdhanstore.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/checkout', '/account', '/account/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
