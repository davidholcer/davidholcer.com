'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/', label: 'Works' },
  { href: '/blog', label: 'Blog' },
];

const socialLinks = [
  { href: 'https://twitter.com/davidholcer', label: 'Twitter' },
  { href: 'https://instagram.com/davidholcer', label: 'Instagram' },
];

export default function Footer() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
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
    const observer = new MutationObserver(() => {
      getTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';
  const subtleText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <footer
      className={`footer-creative w-full ${bgColor} ${textColor} border-t ${borderColor} pt-24 pb-16 px-4 md:px-20 lg:px-40 relative z-10`}
      data-scroll-section
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-20 md:gap-0">
        {/* Left: Manifesto/Tagline */}
        <div className="flex-1 mb-12 md:mb-0">
          <h2 className="mb-6 text-5xl md:text-6xl font-bold saans leading-tight" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
            Building the next creative layer of the internet.
          </h2>
          <p className={`text-2xl ${subtleText} max-w-xl font-light`}>
            Generative art, design, and technology.
          </p>
        </div>
        {/* Center: Navigation & Social */}
        <div className="flex-1 flex flex-col items-start md:items-center mb-12 md:mb-0">
          <nav className="flex flex-col gap-4 text-2xl font-medium mb-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-blue-500"
                style={{ color: theme === 'dark' ? '#d1d5db' : '#222' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="footer-social flex gap-8 mt-2">
            {socialLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors text-2xl hover:text-blue-500"
                style={{ color: theme === 'dark' ? '#d1d5db' : '#222' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        {/* Right: Contact & Legal */}
        <div className="flex-1 flex flex-col items-start md:items-end">
          <div className="footer-contact mb-8">
            <span className="block text-2xl font-semibold mb-3">Stay in touch</span>
            <a
              href="mailto:david@holcer.com"
              className="text-blue-500 hover:underline text-2xl font-light"
            >
              david@holcer.com
            </a>
          </div>
          <div className="flex gap-6 text-lg mt-2">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
          </div>
        </div>
      </div>
      <div className={`footer-legal mt-20 pt-8 text-center ${subtleText} text-lg`}>
        &copy; {new Date().getFullYear()} David Holcer. All rights reserved.
      </div>
    </footer>
  );
} 