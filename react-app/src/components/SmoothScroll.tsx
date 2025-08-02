"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if smooth scroll should be enabled for this page
    const shouldEnableSmoothScroll = () => {
      // Enable for home page (has data-scroll attributes)
      const hasScrollElements = document.querySelectorAll('[data-scroll]').length > 0;
      // Enable for pages with specific scroll sections
      const hasScrollSections = document.querySelectorAll('[data-scroll-section]').length > 0;
      
      console.log('GSAP smooth scroll check:', {
        hasScrollElements,
        hasScrollSections,
        scrollElementsCount: document.querySelectorAll('[data-scroll]').length,
        scrollSectionsCount: document.querySelectorAll('[data-scroll-section]').length
      });
      
      return hasScrollElements || hasScrollSections;
    };
    
    if (!shouldEnableSmoothScroll()) {
      console.log('No smooth scroll elements found, using normal scroll');
      return;
    }

    console.log('Initializing GSAP smooth scroll effects...');

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

    // Add subtle parallax effects for data-scroll-section elements
    const scrollSections = document.querySelectorAll('[data-scroll-section]');
    scrollSections.forEach((section, index) => {
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

    console.log('GSAP smooth scroll effects initialized successfully');

    return () => {
      // Kill all ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}