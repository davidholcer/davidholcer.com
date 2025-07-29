import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';

export const useLocomotiveScroll = () => {
  const locomotiveRef = useRef<LocomotiveScroll | null>(null);

  const scrollTo = (target: string | HTMLElement, options?: any) => {
    if (locomotiveRef.current) {
      locomotiveRef.current.scrollTo(target, options);
    }
  };

  const scrollToTop = () => {
    if (locomotiveRef.current) {
      locomotiveRef.current.scrollTo(0);
    }
  };

  const update = () => {
    if (locomotiveRef.current) {
      locomotiveRef.current.update();
    }
  };

  const destroy = () => {
    if (locomotiveRef.current) {
      locomotiveRef.current.destroy();
      locomotiveRef.current = null;
    }
  };

  return {
    locomotiveRef,
    scrollTo,
    scrollToTop,
    update,
    destroy,
  };
}; 