import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prabhandhan Store — Fresh Daily Grocery E-Commerce',
  description: 'Clean, modern, fresh, and trustworthy Indian grocery shopping platform with 45-minute delivery, genuine brands, and farm-fresh produce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAFAF7] text-[#1F2937] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
