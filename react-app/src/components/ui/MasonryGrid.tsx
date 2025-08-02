import React, { useEffect, useRef, useState } from 'react';

interface MasonryGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  children, 
  columns = 3, 
  gap = 24, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);
  const [responsiveColumns, setResponsiveColumns] = useState(columns);

  useEffect(() => {
    const updateResponsiveColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setResponsiveColumns(1);
      } else if (width < 1024) {
        setResponsiveColumns(2);
      } else {
        setResponsiveColumns(columns);
      }
    };

    updateResponsiveColumns();
    window.addEventListener('resize', updateResponsiveColumns);
    
    return () => window.removeEventListener('resize', updateResponsiveColumns);
  }, [columns]);

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const items = Array.from(container.children) as HTMLElement[];
      
      // Reset column heights
      const heights = new Array(responsiveColumns).fill(0);
      
      items.forEach((item, index) => {
        // Find the shortest column
        const shortestColumn = heights.indexOf(Math.min(...heights));
        
        // Position the item
        const x = shortestColumn * (100 / responsiveColumns);
        const y = heights[shortestColumn];
        
        item.style.position = 'absolute';
        item.style.left = `${x}%`;
        item.style.top = `${y}px`;
        item.style.width = `${100 / responsiveColumns - 3}%`;
        item.style.transition = 'all 0.3s ease-out';
        
        // Update column height
        heights[shortestColumn] += item.offsetHeight + gap;
      });
      
      setColumnHeights(heights);
    };

    // Initial layout with delay to ensure images are loaded
    const timer = setTimeout(updateLayout, 100);

    // Update on window resize
    const handleResize = () => {
      clearTimeout(timer);
      setTimeout(updateLayout, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Update when children change
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      setTimeout(updateLayout, 100);
    });
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [children, responsiveColumns, gap]);

  const maxHeight = Math.max(...columnHeights);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        height: maxHeight > 0 ? `${maxHeight}px` : 'auto',
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
}; 