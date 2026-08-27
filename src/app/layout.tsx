import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SiteChrome from '@/components/SiteChrome';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://games.arcaneforge.ai'),
  title: 'Arcane Forge Games',
  description: 'Explore our library of AI-generated games',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
