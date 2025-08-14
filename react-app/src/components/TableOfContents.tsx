'use client';

import { useState, useEffect, useRef } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
  className?: string;
}

export default function TableOfContents({ headings, className = '' }: TableOfContentsProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [tocStyle, setTocStyle] = useState<React.CSSProperties>({});
  const tocRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h2[id], h3[id]');
      let current = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        // Adjust offset to account for fixed header and better detection
        if (rect.top <= 150 && rect.bottom >= 100) {
          current = heading.id;
        }
      });

      setActiveHeading(current);

      // Handle TOC positioning to move with scroll and prevent footer overlap
      if (tocRef.current) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const tocHeight = tocRef.current.offsetHeight;
        const footer = document.querySelector('footer');
        
        // Base position - starts lower and moves with scroll but stays within bounds
        let baseTop = 400 + (scrollY * 0.05); // Start lower and move with scroll at 5% rate
        
        // Ensure TOC doesn't go too high
        const minTop = 200; // Higher minimum top position
        baseTop = Math.max(minTop, baseTop);
        
        // Ensure TOC doesn't go too low (into footer)
        const maxTop = windowHeight - tocHeight - 40; // 40px buffer from bottom
        baseTop = Math.min(maxTop, baseTop);
        
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          const footerTop = footerRect.top;
          
          // If TOC would overlap with footer, adjust its position
          if (baseTop + tocHeight > footerTop - 20) {
            const newTop = footerTop - tocHeight - 20;
            setTocStyle({
              position: 'fixed',
              top: `${Math.max(minTop, newTop)}px`,
              left: '2rem',
              maxHeight: `${Math.min(windowHeight - 320, footerTop - newTop - 40)}px`,
              transition: 'top 0.3s ease-out'
            });
          } else {
            // Normal scroll-based positioning
            setTocStyle({
              position: 'fixed',
              top: `${baseTop}px`,
              left: '2rem',
              maxHeight: 'calc(100vh - 320px)',
              transition: 'top 0.3s ease-out'
            });
          }
        } else {
          // Fallback when footer is not found
          setTocStyle({
            position: 'fixed',
            top: `${baseTop}px`,
            left: '2rem',
            maxHeight: 'calc(100vh - 320px)',
            transition: 'top 0.3s ease-out'
          });
        }
      }
    };

    // Initial call to set active heading and position
    handleScroll();

    // Use locomotive scroll container if available
    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Use simple scrollIntoView for blog pages
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav 
      ref={tocRef}
      className={`toc-sidebar-left ${className}`}
      style={tocStyle}
    >
      <h2 className="text-lg font-medium mb-4 montreal">Contents</h2>
      <ul className="list-none pl-0 space-y-1">
        {headings.map((heading) => (
          <li key={heading.id} className={`transition-colors duration-200 ${
            heading.level === 3 ? 'ml-4' : ''
          }`}>
            <a
              href={`#${heading.id}`}
              className={`block py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                activeHeading === heading.id
                  ? 'active'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
              }`}
              onClick={(e) => handleClick(e, heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
} 