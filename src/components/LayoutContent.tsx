"use client";

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const SmoothScrollProvider = dynamic(() => import('@/components/SmoothScroll'), {
  ssr: false,
});

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
});

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isBlogPage = pathname.startsWith('/blog/') || pathname === '/blog';
  const isAboutPage = pathname === '/about';
  const isWorksPage = pathname === '/works';

  if (isHomePage || isBlogPage || isAboutPage || isWorksPage) {
    return (
      <SmoothScrollProvider>
        <main className="blog-content pt-4">{children}</main>
        <Footer />
      </SmoothScrollProvider>
    );
  }

  return (
    <>
      <main className="blog-content pt-4">{children}</main>
      <Footer />
    </>
  );
}
