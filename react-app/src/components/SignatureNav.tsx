"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/about', label: 'ABOUT ME' },
  { href: '/', label: 'WORKS' },
  { href: '/blog', label: 'BLOG' },
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

  const signatureSrc = theme === 'dark' ? '/assets/images/signature_w.png' : '/assets/images/signature_b.png';
  return (
    <div className="flex flex-col items-center mt-10" data-scroll-section>
      <Link href="/" className="block relative w-[600px] h-[140px] mb-6 group" aria-label="Home" data-scroll data-scroll-speed="0.3">
        {mounted && (
          <Image
            src={signatureSrc}
            alt="David Holcer Signature"
            fill
            className="object-contain transition-opacity group-hover:opacity-80"
            priority
          />
        )}
      </Link>
      <nav className="flex gap-20 text-lg tracking-widest uppercase mb-6" data-scroll data-scroll-speed="0.2">
        {navLinks.map(link => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          // Theme-aware classes
          const baseClass = theme === 'dark'
            ? 'text-gray-500'
            : 'text-gray-400';
          const hoverClass = theme === 'dark'
            ? 'hover:text-white'
            : 'hover:text-black';
          const activeClass = theme === 'dark'
            ? 'border-white text-white font-semibold'
            : 'border-black text-blue-400 font-semibold';
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors pb-1 ${baseClass} ${hoverClass} ${isActive ? activeClass : ''}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 