'use client'

import { useEffect, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

// Navigation tabs removed per request; keeping footer minimal with Studio + brand

const socialLinks = [
  { 
    href: 'https://twitter.com/davidholcer', 
    label: 'Twitter',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    )
  },
  { 
    href: 'https://instagram.com/davidholcer', 
    label: 'Instagram',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  { 
    href: 'https://github.com/davidholcer', 
    label: 'GitHub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  },
  { 
    href: 'https://linkedin.com/in/david-holcer', 
    label: 'LinkedIn',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }
];

export default function Footer() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');

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

  const bgColor = theme === 'dark' ? 'bg-slate-900' : 'bg-[#F5F8FD]';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const accentColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const mutedText = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const cardBg = theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80';

  return (
    <footer
      className={`w-full relative z-10 ${bgColor} ${textColor}`}
      data-scroll-section
    >
      {/* Separator line above footer */}
      <div className={`w-full h-px ${borderColor} bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent`}></div>

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-20">
        {/* Hero headline + CTA */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            <TypeAnimation
              sequence={[
                'Generative art',
                1000,
                'Generative art, thoughtful design',
                1000,
                'Generative art, thoughtful design, and interactive experiences.',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              style={{ display: 'inline-block' }}
            />
          </h2>
          <p className={`mt-4 text-base md:text-lg ${mutedText}`}>I build modern, artful, and performant digital experiences.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:david@davidholcer.com?subject=Let%27s%20work%20together"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 dark:bg-blue-500 px-5 py-3 text-white shadow-sm ring-1 ring-blue-400/30 dark:ring-white/10 transition-all hover:shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Let’s talk
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>

        {/* Brand + Studio, responsive layout */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Brand text (left side) */}
          <div className="flex justify-center lg:justify-start">
            <div
              aria-hidden="true"
              className="leading-none font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-500 dark:from-slate-700 dark:to-slate-400 select-none text-center lg:text-left"
              style={{ fontSize: 'clamp(96px, 14vw, 160px)' }}
            >
              <div>david<br />holcer</div>
            </div>
          </div>

          {/* Studio card (right side, centered vertically) */}
          <div className={`w-full max-w-md mx-auto lg:mx-0 p-5 rounded-2xl ${cardBg} backdrop-blur border ${borderColor}`}>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400">Studio</p>
              <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <p>David Holcer</p>
                <p>Montreal, QC</p>
                <p className="mt-2">
                  <a href="mailto:david@davidholcer.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition">david@davidholcer.com</a>
                </p>
              </div>
            </div>
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
              }}
              aria-label="Newsletter subscription"
            >
              <label htmlFor="newsletter" className={`mb-2 block text-sm ${mutedText}`}>
                Let’s stay in touch
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="newsletter"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400/60`}
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Legal / bottom row */}
        <div className={`pt-8 border-t ${borderColor}`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-300">
              <p>&copy; {new Date().getFullYear()} David Holcer</p>
              <p className="text-xs">All investing involves risk. This site is a personal portfolio and blog.</p>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map(link => (
                <a
                  key={`bottom-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative grid place-items-center h-10 w-10 rounded-full ${cardBg} backdrop-blur border ${borderColor} transition hover:translate-y-[-1px] hover:shadow-lg`}
                  aria-label={link.label}
                >
                  <div className="relative z-10 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 