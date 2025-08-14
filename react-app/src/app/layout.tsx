import './globals.css';
import type { Metadata } from 'next';
import SignatureNav from '@/components/SignatureNav';
import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';
import { HeroUIProvider } from '@heroui/react';

const SmoothScrollProvider = dynamic(() => import('@/components/SmoothScroll'), {
  ssr: false,
});

const LayoutContent = dynamic(() => import('@/components/LayoutContent'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'David Holcer',
  description: 'Personal website and blog',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <HeroUIProvider>
          <SignatureNav />
          <LayoutContent>{children}</LayoutContent>
        </HeroUIProvider>
      </body>
    </html>
  );
} 