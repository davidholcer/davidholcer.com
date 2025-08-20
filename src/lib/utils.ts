import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects if the current device is mobile
 * @returns boolean indicating if the device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side, assume desktop
  }
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  
  // Mobile detection regex patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  return mobileRegex.test(userAgent);
}

/**
 * Gets the current viewport dimensions
 * @returns object with width and height
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 }; // Default desktop dimensions
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}