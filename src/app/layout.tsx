import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/context/AppProviders';
import { Header } from '@/components/layout/Header';
import { FloatingCartBar } from '@/components/layout/FloatingCartBar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Pravdhan Store | Fast Local Grocery & Daily Essentials Delivery',
  description:
    'Order fresh fruits, vegetables, dairy, atta, dal, and everyday grocery items from your trusted local store. Same-day & scheduled delivery in Lucknow.',
  keywords: [
    'grocery delivery',
    'quick grocery',
    'kirana delivery',
    'fresh vegetables',
    'amul milk',
    'aashirvaad atta',
    'lucknow grocery store',
    'scheduled delivery',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-100 selection:text-blue-900">
        <AppProviders>
          <Header />
          <main className="flex-1 w-full pb-16 sm:pb-0">{children}</main>
          <FloatingCartBar />
          <BottomNavigation />
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
