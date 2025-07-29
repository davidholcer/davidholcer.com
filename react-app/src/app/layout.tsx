import './globals.css';
import type { Metadata } from 'next';
import ThemeToggle from '@/components/ThemeToggle';
import SignatureNav from '@/components/SignatureNav';
import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';

const LocomotiveScrollProvider = dynamic(() => import('@/components/LocomotiveScroll'), {
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
        <LocomotiveScrollProvider>
          <ThemeToggle />
          <SignatureNav />
          <main className="blog-content pt-4">{children}</main>
          <Footer />
        </LocomotiveScrollProvider>
      </body>
    </html>
  );
} 