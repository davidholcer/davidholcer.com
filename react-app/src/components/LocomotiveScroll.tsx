"use client";
import { useEffect } from "react";
import LocomotiveScroll from "locomotive-scroll";

export default function LocomotiveScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const scroll = new LocomotiveScroll({
      el: document.querySelector("[data-scroll-container]") as HTMLElement,
      smooth: true,
      lerp: 0.1,
      multiplier: 1,
    });
    const updateHandler = () => scroll.update();
    window.addEventListener('locomotive-update', updateHandler);
    return () => {
      window.removeEventListener('locomotive-update', updateHandler);
      scroll.destroy();
    };
  }, []);

  return (
    <div data-scroll-container>
      {children}
    </div>
  );
}