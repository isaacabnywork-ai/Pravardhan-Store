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
    default: 'Pravdhan Store | 12-Min Express Grocery Delivery in Gurugram',
    template: '%s | Pravdhan Store',
  },
  description:
    'Pravdhan Store delivers fresh groceries, atta, rice, pulses, dairy, fresh farm produce, and household essentials to your doorstep in Sector 14, Model Town, Gurugram in 12–15 minutes.',
  keywords: [
    'Pravdhan Store',
    'Gurugram grocery delivery',
    'Sector 14 groceries',
    'Model Town instant delivery',
    'fresh fruits vegetables Gurugram',
    'chakki atta delivery',
    'quick commerce Gurugram',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pravdhanstore.in'),
  openGraph: {
    title: 'Pravdhan Store | 12-Min Grocery Delivery Gurugram',
    description:
      'Ultra-fast delivery of fresh farm produce, groceries, dairy, and household essentials in Sector 14 and Model Town, Gurugram.',
    url: 'https://pravdhanstore.in',
    siteName: 'Pravdhan Store',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pravdhan Store | 12-Min Express Grocery Delivery',
    description:
      'Fresh staples, dairy, organic produce and household essentials in Gurugram.',
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
