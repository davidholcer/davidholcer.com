"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<any>(null);

  useEffect(() => {
    // Check if smooth scroll should be enabled for this page
    const shouldEnableSmoothScroll = () => {
      // Disable for works detail pages to prevent flickering
      const isWorksDetailPage = window.location.pathname.includes('/works/') && window.location.pathname !== '/works';
      if (isWorksDetailPage) {
        console.log('Works detail page detected, disabling smooth scroll to prevent flickering');
        return false;
      }
      
      // Enable for home page, about page, works page, and blog pages
      const hasScrollElements = document.querySelectorAll('[data-scroll]').length > 0;
      // Enable for pages with specific scroll sections
      const hasScrollSections = document.querySelectorAll('[data-scroll-section]').length > 0;
      
      console.log('GSAP smooth scroll check:', {
        isWorksDetailPage,
        hasScrollElements,
        hasScrollSections,
        scrollElementsCount: document.querySelectorAll('[data-scroll]').length,
        scrollSectionsCount: document.querySelectorAll('[data-scroll-section]').length,
        pathname: window.location.pathname
      });
      
      // Always enable for pages that are wrapped with SmoothScrollProvider
      // (home, about, works, blog pages)
      return true;
    };
    
    if (!shouldEnableSmoothScroll()) {
      console.log('No smooth scroll elements found, using normal scroll');
      return;
    }

    console.log('Initializing GSAP ScrollSmoother...');

    // Create ScrollSmoother instance
    smootherRef.current = ScrollSmoother.create({
      wrapper: containerRef.current,
      content: containerRef.current?.querySelector('.smooth-content'),
      smooth: 1.2, // Reduced smoothness for better performance
      effects: true, // Enable effects
      normalizeScroll: true, // Normalize scroll across devices
      ignoreMobileResize: true, // Ignore mobile resize events
      smoothTouch: 0.1, // Smooth scrolling on touch devices
    });

    // Add subtle GSAP scroll effects for data-scroll elements
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach((element, index) => {
      const speed = element.getAttribute('data-scroll-speed') || '1';
      const speedValue = parseFloat(speed);
      
      gsap.to(element, {
        y: `${(index + 1) * 30 * speedValue}`, // Subtle movement
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 1, // Smooth scrubbing
        }
      });
    });

    // Add subtle parallax effects for data-scroll-section elements (excluding blog content)
    const scrollSections = document.querySelectorAll('[data-scroll-section]');
    scrollSections.forEach((section, index) => {
      // Skip blog content to prevent flickering
      if (section.closest('.blog-content-container')) {
        return;
      }
      
      gsap.to(section, {
        y: -30, // Subtle parallax movement
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });
    });

    console.log('GSAP ScrollSmoother initialized successfully');

    return () => {
      // Kill ScrollSmoother instance
      if (smootherRef.current) {
        smootherRef.current.kill();
      }
      // Kill all ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="smooth-wrapper">
      <div className="smooth-content">
        {children}
      </div>
    </div>
  );
}