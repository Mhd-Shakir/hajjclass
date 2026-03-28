import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hajj Darulaman — Contact Management',
  description:
    'A modern contact management system for Hajj Darulaman. Manage, search, and print contact lists with ease.',
  keywords: ['contacts', 'Hajj', 'Darulaman', 'contact management', 'phone directory'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
