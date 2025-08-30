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

      // Find the current heading based on scroll position
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        // More precise detection - consider a heading active when it's near the top of viewport
        if (rect.top <= 100 && rect.bottom >= 50) {
          current = heading.id;
        }
      });

      // If no heading is in the viewport, find the closest one above
      if (!current) {
        const headingsArray = Array.from(headings);
        for (let i = headingsArray.length - 1; i >= 0; i--) {
          const heading = headingsArray[i];
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 100) {
            current = heading.id;
            break;
          }
        }
      }

      setActiveHeading(current);

      // Fixed positioning below header - account for SignatureNav height
      if (tocRef.current) {
        const windowHeight = window.innerHeight;
        const tocHeight = tocRef.current.offsetHeight;
        const footer = document.querySelector('footer');
        
        // Position below the header (SignatureNav is ~170px total height)
        // Use same positioning as the back links which are at top-72 (288px)
        let topPosition = 200; // Position below header with some buffer
        
        // Check if TOC would overlap with footer
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          const footerTop = footerRect.top;
          
          // If footer is visible and would overlap, move TOC up
          if (footerTop < windowHeight && topPosition + tocHeight > footerTop - 20) {
            topPosition = Math.max(200, footerTop - tocHeight - 20);
          }
        }
        
        setTocStyle({
          position: 'fixed',
          top: `${topPosition}px`,
          left: '2rem',
          maxHeight: `calc(100vh - ${topPosition + 40}px)`,
          transition: 'top 0.3s ease-out'
        });
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
      <ol className="list-none pl-0 space-y-2 text-sm">
        {headings.map((heading, index) => {
          // Count only H2 headings for numbering
          const h2Count = headings.slice(0, index + 1).filter(h => h.level === 2).length;
          
          return (
            <li key={heading.id} className={`transition-colors duration-200 ${
              heading.level === 3 ? 'ml-4' : ''
            }`}>
              <a
                href={`#${heading.id}`}
                className={`block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 ${
                  activeHeading === heading.id
                    ? 'active'
                    : ''
                }`}
                onClick={(e) => handleClick(e, heading.id)}
              >
                {heading.level === 2 ? `${h2Count}. ` : ''}{heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 