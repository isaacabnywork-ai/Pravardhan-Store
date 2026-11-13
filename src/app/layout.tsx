import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Pravdhan Store | Online Grocery & Daily Essentials in Lucknow',
    template: '%s | Pravdhan Store',
  },
  description:
    'Pravdhan Store delivers fresh groceries, atta, rice, pulses, dairy, fresh farm produce, and household essentials to your doorstep in Vrindavan Colony, Lucknow with 1-hour & flexible scheduled delivery.',
  keywords: [
    'Pravdhan Store',
    'Lucknow grocery delivery',
    'Vrindavan Colony groceries',
    'scheduled grocery delivery',
    'fresh fruits vegetables Lucknow',
    'chakki atta delivery',
    'ecommerce grocery store',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pravdhanstore.in'),
  openGraph: {
    title: 'Pravdhan Store | Online Grocery Delivery in Lucknow',
    description:
      'Reliable delivery of fresh farm produce, groceries, dairy, and household essentials in Vrindavan Colony, Lucknow.',
    url: 'https://pravdhanstore.in',
    siteName: 'Pravdhan Store',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pravdhan Store | Grocery & Daily Essentials Delivery',
    description:
      'Fresh staples, dairy, organic produce and household essentials in Vrindavan Colony, Lucknow.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const groceryStoreStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'GroceryStore',
  name: 'Pravdhan Store',
  image:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  telephone: '+91-124-456-7890',
  email: 'care@pravdhanstore.in',
  url: 'https://pravdhanstore.in',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sector 14 Main Market, Near Old DLF Colony',
    addressLocality: 'Gurugram',
    addressRegion: 'Haryana',
    postalCode: '122001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '28.4720',
    longitude: '77.0425',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '07:00',
      closes: '22:00',
    },
  ],
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, UPI, Net Banking',
  areaServed: [
    'Sector 14, Gurugram',
    'Model Town, Gurugram',
    'Old DLF Colony, Gurugram',
    'Sector 15 Part 1, Gurugram',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('pravdhan_theme');
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(groceryStoreStructuredData),
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
