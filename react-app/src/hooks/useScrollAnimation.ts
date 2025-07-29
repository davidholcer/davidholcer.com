import { useEffect, useRef } from 'react';

interface UseScrollAnimationOptions {
  speed?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const ref = useRef<HTMLElement>(null);
  const {
    speed = 0.1,
    delay = 0,
    direction = 'up',
    threshold = 0.1
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    // Add data-scroll attributes
    element.setAttribute('data-scroll', '');
    element.setAttribute('data-scroll-speed', speed.toString());
    
    if (delay > 0) {
      element.setAttribute('data-scroll-delay', delay.toString());
    }

    // Add direction-based classes
    element.classList.add(`scroll-${direction}`);

    // Add threshold
    element.setAttribute('data-scroll-threshold', threshold.toString());

    return () => {
      // Cleanup
      element.removeAttribute('data-scroll');
      element.removeAttribute('data-scroll-speed');
      element.removeAttribute('data-scroll-delay');
      element.removeAttribute('data-scroll-threshold');
      element.classList.remove(`scroll-${direction}`);
    };
  }, [speed, delay, direction, threshold]);

  return ref;
}; 