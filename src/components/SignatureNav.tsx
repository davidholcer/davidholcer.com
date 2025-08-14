"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/about', label: 'ABOUT ME', isAnchor: false },
  { href: '/works', label: 'WORKS', isAnchor: false },
  { href: '/blog', label: 'BLOG', isAnchor: false },
];

export default function SignatureNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or data-theme attribute
    const getTheme = () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const attrTheme = document.documentElement.getAttribute('data-theme');
        if (attrTheme === 'dark' || attrTheme === 'light') setTheme(attrTheme);
      }
    };
    getTheme();
    // Listen for theme changes (from ThemeToggle)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    // MutationObserver for data-theme changes
    const observer = new MutationObserver(() => {
      getTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);

  // Ensure light/dark signatures resolve; fall back to light signature if white missing
  const signatureSrc = theme === 'dark' ? '/assets/images/signature_w.png' : '/assets/images/signature_b.png';
  
  // Add a key to force re-render when theme changes
  const imageKey = `${signatureSrc}-${theme}`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-white/20 dark:border-gray-700/30 shadow-lg">
      <div className="flex flex-col items-center py-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Link href="/" className="block relative w-[320px] sm:w-[380px] h-[80px] sm:h-[100px] mb-4 group" aria-label="Home">
        {mounted && (
          <Image
            key={imageKey}
            src={signatureSrc}
            alt="David Holcer Signature"
            fill
            className="object-contain transition-opacity group-hover:opacity-80"
            priority
            onError={(e) => {
              console.error('Failed to load signature image:', signatureSrc);
            }}
          />
        )}
      </Link>
      <nav className="flex gap-20 text-lg tracking-widest uppercase">
        {navLinks.map(link => {
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link transition-colors pb-1 ${isActive ? 'border-b-2 font-semibold' : ''}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      </div>
    </div>
  );
} 